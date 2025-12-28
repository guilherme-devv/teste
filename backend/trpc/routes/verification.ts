import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const verificationRouter = createTRPCRouter({
  uploadDocuments: protectedProcedure
    .input(
      z.object({
        documentUrls: z.array(z.string()).min(1, "Envie pelo menos um documento"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = db.sessions.findByToken(ctx.token);
      
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida",
        });
      }

      const user = db.users.findById(session.userId);
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (!user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verifique seu e-mail primeiro",
        });
      }

      db.users.update(user.id, {
        documentUrls: input.documentUrls,
        identityStatus: "submitted",
      });

      console.log(`📄 Documentos enviados por ${user.email}`);
      console.log(`URLs: ${input.documentUrls.join(", ")}`);

      return {
        success: true,
        message: "Documentos enviados para análise!",
      };
    }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const session = db.sessions.findByToken(ctx.token);
    
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Sessão inválida",
      });
    }

    const user = db.users.findById(session.userId);
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
      });
    }

    return {
      status: user.identityStatus,
      documentUrls: user.documentUrls,
      rejectionReason: user.rejectionReason,
    };
  }),
});
