import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { generateToken, generateVerificationCode, hashPassword, verifyPassword } from "@/backend/lib/auth";
import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = db.users.findByEmail(input.email);
      
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "E-mail já cadastrado",
        });
      }

      const verificationCode = generateVerificationCode();
      
      const user = db.users.create({
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        password: hashPassword(input.password),
        emailVerified: false,
        verificationCode,
        identityStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`📧 Código de verificação para ${input.email}: ${verificationCode}`);

      return {
        success: true,
        userId: user.id,
        message: "Cadastro realizado! Verifique seu e-mail.",
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = db.users.findByEmail(input.email);

      if (!user || !verifyPassword(input.password, user.password)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "E-mail ou senha incorretos",
        });
      }

      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      db.sessions.create({
        token,
        userId: user.id,
        expiresAt,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          identityStatus: user.identityStatus,
        },
      };
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
      }),
    )
    .mutation(async ({ input }) => {
      const user = db.users.findByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (user.verificationCode !== input.code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Código de verificação inválido",
        });
      }

      db.users.update(user.id, {
        emailVerified: true,
        verificationCode: undefined,
      });

      return {
        success: true,
        message: "E-mail verificado com sucesso!",
      };
    }),

  resendVerificationCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = db.users.findByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "E-mail já verificado",
        });
      }

      const newCode = generateVerificationCode();
      db.users.update(user.id, {
        verificationCode: newCode,
      });

      console.log(`📧 Novo código de verificação para ${input.email}: ${newCode}`);

      return {
        success: true,
        message: "Código reenviado!",
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
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
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      identityStatus: user.identityStatus,
      documentUrls: user.documentUrls,
      rejectionReason: user.rejectionReason,
    };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    db.sessions.deleteByToken(ctx.token);
    return { success: true };
  }),
});
