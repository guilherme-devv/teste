import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const chatRouter = createTRPCRouter({
  startConversation: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode iniciar uma conversa consigo mesmo",
        });
      }

      const targetUser = db.users.findById(input.userId);
      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      const existingConversation = db.conversations.findByParticipants(ctx.userId, input.userId);
      if (existingConversation) {
        return existingConversation;
      }

      const conversation = db.conversations.create({
        id: crypto.randomUUID(),
        participantIds: [ctx.userId, input.userId],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`💬 Conversa iniciada: ${conversation.id}`);

      return conversation;
    }),

  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const conversations = db.conversations.findByUserId(ctx.userId);

      const conversationsWithDetails = conversations.map((conversation) => {
        const otherUserId = conversation.participantIds.find((id) => id !== ctx.userId);
        const otherUser = otherUserId ? db.users.findById(otherUserId) : null;
        
        const messages = db.chatMessages.findByConversationId(conversation.id);
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter((m) => m.senderId !== ctx.userId && !m.read).length;

        return {
          ...conversation,
          otherUser: otherUser ? { id: otherUser.id, name: otherUser.name } : null,
          lastMessage,
          unreadCount,
        };
      });

      return {
        conversations: conversationsWithDetails,
      };
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const conversation = db.conversations.findById(input.conversationId);

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });
      }

      if (!conversation.participantIds.includes(ctx.userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem acesso a esta conversa",
        });
      }

      db.chatMessages.markAsRead(input.conversationId, ctx.userId);

      const messages = db.chatMessages.findByConversationId(input.conversationId);

      const messagesWithUsers = messages.map((message) => {
        const sender = db.users.findById(message.senderId);
        return {
          ...message,
          sender: sender ? { id: sender.id, name: sender.name } : null,
        };
      });

      return {
        messages: messagesWithUsers,
      };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1, "Mensagem não pode estar vazia"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const conversation = db.conversations.findById(input.conversationId);

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });
      }

      if (!conversation.participantIds.includes(ctx.userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem acesso a esta conversa",
        });
      }

      const message = db.chatMessages.create({
        id: crypto.randomUUID(),
        conversationId: input.conversationId,
        senderId: ctx.userId,
        content: input.content,
        read: false,
        createdAt: new Date(),
      });

      db.conversations.update(input.conversationId, {
        lastMessage: message,
        updatedAt: new Date(),
      });

      console.log(`💬 Mensagem enviada: ${message.id}`);

      return message;
    }),
});
