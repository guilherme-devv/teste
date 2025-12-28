import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const sharesRouter = createTRPCRouter({
  share: protectedProcedure
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
          message: "Não é possível compartilhar um post não aprovado",
        });
      }

      const existingShares = db.shares.findByPostId(input.postId);
      const alreadyShared = existingShares.find(s => s.userId === ctx.userId);

      if (alreadyShared) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já compartilhou este post",
        });
      }

      const share = db.shares.create({
        id: crypto.randomUUID(),
        postId: input.postId,
        userId: ctx.userId,
        createdAt: new Date(),
      });

      db.posts.incrementShares(input.postId);

      console.log(`🔄 Post compartilhado: ${input.postId} por ${ctx.userId}`);

      return {
        success: true,
        share,
      };
    }),

  getByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const shares = db.shares.findByPostId(input.postId);
      
      return {
        count: shares.length,
        shares: shares.map(share => ({
          ...share,
          user: db.users.findById(share.userId),
        })),
      };
    }),

  getMyShares: protectedProcedure
    .query(async ({ ctx }) => {
      const shares = db.shares.findByUserId(ctx.userId);
      
      return shares.map(share => {
        const post = db.posts.findById(share.postId);
        const user = post ? db.users.findById(post.userId) : null;
        
        return {
          ...share,
          post: post ? {
            ...post,
            user: user ? { id: user.id, name: user.name } : null,
          } : null,
        };
      });
    }),
});
