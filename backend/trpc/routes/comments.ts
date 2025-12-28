import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1, "Comentário não pode estar vazio").max(1000, "Comentário muito longo"),
        parentId: z.string().optional(),
      }),
    )
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
          message: "Não é possível comentar em um post não aprovado",
        });
      }

      if (input.parentId) {
        const parentComment = db.comments.findById(input.parentId);
        if (!parentComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comentário pai não encontrado",
          });
        }
      }

      const comment = db.comments.create({
        id: crypto.randomUUID(),
        postId: input.postId,
        userId: ctx.userId,
        content: input.content,
        parentId: input.parentId,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.posts.incrementComments(input.postId);

      const user = db.users.findById(ctx.userId);

      console.log(`💬 Comentário criado: ${comment.id} no post ${input.postId}`);

      return {
        ...comment,
        user: user ? { id: user.id, name: user.name } : null,
      };
    }),

  getByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const post = db.posts.findById(input.postId);
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      const comments = db.comments.findByPostId(input.postId);
      
      const commentsWithUsers = comments.map((comment) => {
        const user = db.users.findById(comment.userId);
        return {
          ...comment,
          user: user ? { id: user.id, name: user.name } : null,
        };
      });

      return commentsWithUsers;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1, "Comentário não pode estar vazio").max(1000, "Comentário muito longo"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = db.comments.findById(input.id);
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comentário não encontrado",
        });
      }

      if (comment.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este comentário",
        });
      }

      const updated = db.comments.update(comment.id, {
        content: input.content,
      });

      const user = db.users.findById(ctx.userId);

      return {
        ...updated,
        user: user ? { id: user.id, name: user.name } : null,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const comment = db.comments.findById(input.id);
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comentário não encontrado",
        });
      }

      if (comment.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para deletar este comentário",
        });
      }

      const deleted = db.comments.delete(comment.id);
      
      if (deleted) {
        db.posts.decrementComments(comment.postId);
      }

      return { success: true };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const comment = db.comments.findById(input.commentId);
      
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comentário não encontrado",
        });
      }

      const updated = db.comments.toggleLike(input.commentId, ctx.userId);
      const isLiked = updated?.likes.includes(ctx.userId) || false;

      return {
        comment: updated,
        isLiked,
        likesCount: updated?.likes.length || 0,
      };
    }),
});
