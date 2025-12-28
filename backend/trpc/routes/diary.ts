import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const diaryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Título não pode estar vazio"),
        content: z.string().min(1, "Conteúdo não pode estar vazio"),
        mood: z.enum(["feliz", "cansado", "preocupado", "emocionado", "grato"]),
        milestones: z.array(z.string()),
        mediaUrls: z.array(z.string().url()).optional(),
        private: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const entry = db.diaryEntries.create({
        id: crypto.randomUUID(),
        userId: ctx.userId,
        title: input.title,
        content: input.content,
        mood: input.mood,
        milestones: input.milestones,
        mediaUrls: input.mediaUrls,
        private: input.private,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.userRewards.addActivity(ctx.userId, "diary", 10);

      console.log(`📔 Entrada de diário criada: ${entry.id}`);

      return entry;
    }),

  getMyEntries: protectedProcedure
    .query(async ({ ctx }) => {
      const entries = db.diaryEntries.findByUserId(ctx.userId);

      return {
        entries,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const entry = db.diaryEntries.findById(input.id);

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada não encontrada",
        });
      }

      if (entry.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para ver esta entrada",
        });
      }

      return entry;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        mood: z.enum(["feliz", "cansado", "preocupado", "emocionado", "grato"]).optional(),
        milestones: z.array(z.string()).optional(),
        mediaUrls: z.array(z.string().url()).optional(),
        private: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const entry = db.diaryEntries.findById(input.id);

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada não encontrada",
        });
      }

      if (entry.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar esta entrada",
        });
      }

      const updated = db.diaryEntries.update(entry.id, {
        title: input.title,
        content: input.content,
        mood: input.mood,
        milestones: input.milestones,
        mediaUrls: input.mediaUrls,
        private: input.private,
      });

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const entry = db.diaryEntries.findById(input.id);

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada não encontrada",
        });
      }

      if (entry.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para deletar esta entrada",
        });
      }

      db.diaryEntries.delete(entry.id);

      return { success: true };
    }),
});
