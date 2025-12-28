import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const badWords = [
  "ódio", "preconceito", "racismo", "violência", "idiota", "estúpido",
  "burro", "hate", "stupid", "idiot", "racism", "violence"
];

function moderateContent(content: string): { approved: boolean; reason?: string } {
  const lowerContent = content.toLowerCase();
  
  for (const word of badWords) {
    if (lowerContent.includes(word)) {
      return {
        approved: false,
        reason: `Conteúdo contém linguagem inadequada: "${word}"`
      };
    }
  }
  
  if (content.length < 5) {
    return {
      approved: false,
      reason: "Conteúdo muito curto"
    };
  }
  
  if (content.length > 5000) {
    return {
      approved: false,
      reason: "Conteúdo muito longo (máximo 5000 caracteres)"
    };
  }
  
  return { approved: true };
}

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Conteúdo não pode estar vazio"),
        mediaUrls: z.array(z.string().url()).optional(),
        mediaType: z.enum(["image", "video"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = db.users.findById(ctx.userId);
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (user.identityStatus !== "approved") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você precisa ter sua identidade verificada para publicar",
        });
      }

      const moderation = moderateContent(input.content);
      
      const post = db.posts.create({
        id: crypto.randomUUID(),
        userId: ctx.userId,
        content: input.content,
        mediaUrls: input.mediaUrls,
        mediaType: input.mediaType,
        status: moderation.approved ? "approved" : "rejected",
        rejectionReason: moderation.reason,
        likes: [],
        commentsCount: 0,
        sharesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`📝 Post criado: ${post.id} - Status: ${post.status}`);

      return {
        post: {
          ...post,
          user: {
            id: user.id,
            name: user.name,
          }
        },
        moderation: moderation.approved ? null : moderation.reason,
      };
    }),

  getFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const posts = db.posts.getApproved(input.limit, input.offset);
      
      const postsWithUsers = posts.map((post) => {
        const user = db.users.findById(post.userId);
        return {
          ...post,
          user: user ? { id: user.id, name: user.name } : null,
        };
      });

      return {
        posts: postsWithUsers,
        hasMore: db.posts.getApproved().length > input.offset + input.limit,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = db.posts.findById(input.id);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      const user = db.users.findById(post.userId);
      
      return {
        ...post,
        user: user ? { id: user.id, name: user.name } : null,
      };
    }),

  getMyPosts: protectedProcedure
    .query(async ({ ctx }) => {
      const posts = db.posts.findByUserId(ctx.userId);
      
      return posts.map((post) => {
        const user = db.users.findById(post.userId);
        return {
          ...post,
          user: user ? { id: user.id, name: user.name } : null,
        };
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1, "Conteúdo não pode estar vazio"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const post = db.posts.findById(input.id);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      if (post.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este post",
        });
      }

      const moderation = moderateContent(input.content);
      
      const updated = db.posts.update(post.id, {
        content: input.content,
        status: moderation.approved ? "approved" : "rejected",
        rejectionReason: moderation.reason,
      });

      return {
        post: updated,
        moderation: moderation.approved ? null : moderation.reason,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = db.posts.findById(input.id);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      if (post.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para deletar este post",
        });
      }

      db.posts.delete(post.id);

      return { success: true };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = db.posts.findById(input.postId);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      if (post.status !== "approved") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Não é possível curtir um post não aprovado",
        });
      }

      const updated = db.posts.toggleLike(input.postId, ctx.userId);
      const isLiked = updated?.likes.includes(ctx.userId) || false;

      return {
        post: updated,
        isLiked,
        likesCount: updated?.likes.length || 0,
      };
    }),
});
