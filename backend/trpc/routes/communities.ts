import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const sampleCommunities = [
  {
    name: "Pais de São Paulo - Zona Sul",
    description: "Grupo para pais da zona sul de São Paulo trocarem experiências e organizarem encontros",
    location: { city: "São Paulo", state: "SP" },
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
  },
  {
    name: "Mães do Rio - Barra",
    description: "Comunidade de mães da Barra da Tijuca para apoio mútuo e dicas locais",
    location: { city: "Rio de Janeiro", state: "RJ" },
    imageUrl: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800",
  },
  {
    name: "Papais e Mamães de BH",
    description: "Grupo de pais de primeira viagem em Belo Horizonte",
    location: { city: "Belo Horizonte", state: "MG" },
    imageUrl: "https://images.unsplash.com/photo-1533093818801-e543b9c17e25?w=800",
  },
];

export const communitiesRouter = createTRPCRouter({
  seedCommunities: protectedProcedure
    .mutation(async ({ ctx }) => {
      const existing = db.communities.getAll();
      if (existing.length > 0) {
        return { message: "Comunidades já existem", count: existing.length };
      }

      sampleCommunities.forEach((community) => {
        db.communities.create({
          id: crypto.randomUUID(),
          ...community,
          memberIds: [ctx.userId],
          creatorId: ctx.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      console.log(`👥 ${sampleCommunities.length} comunidades criadas`);

      return { message: "Comunidades criadas com sucesso", count: sampleCommunities.length };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome não pode estar vazio"),
        description: z.string().min(1, "Descrição não pode estar vazia"),
        city: z.string().min(1, "Cidade não pode estar vazia"),
        state: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const community = db.communities.create({
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description,
        location: {
          city: input.city,
          state: input.state,
        },
        imageUrl: input.imageUrl,
        memberIds: [ctx.userId],
        creatorId: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`👥 Comunidade criada: ${community.id}`);

      return community;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        city: z.string().optional(),
        state: z.string().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      let communities = db.communities.getAll();

      if (input?.city && input?.state) {
        communities = db.communities.findByLocation(input.city, input.state);
      }

      const communitiesWithDetails = communities.map((community) => {
        const creator = db.users.findById(community.creatorId);
        return {
          ...community,
          memberCount: community.memberIds.length,
          creator: creator ? { id: creator.id, name: creator.name } : null,
        };
      });

      return {
        communities: communitiesWithDetails,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const community = db.communities.findById(input.id);

      if (!community) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comunidade não encontrada",
        });
      }

      const creator = db.users.findById(community.creatorId);
      const isMember = community.memberIds.includes(ctx.userId);

      return {
        ...community,
        memberCount: community.memberIds.length,
        creator: creator ? { id: creator.id, name: creator.name } : null,
        isMember,
      };
    }),

  join: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const community = db.communities.findById(input.communityId);

      if (!community) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comunidade não encontrada",
        });
      }

      if (community.memberIds.includes(ctx.userId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já é membro desta comunidade",
        });
      }

      const updated = db.communities.addMember(input.communityId, ctx.userId);

      console.log(`👥 Usuário ${ctx.userId} entrou na comunidade ${input.communityId}`);

      return {
        community: updated,
        memberCount: updated?.memberIds.length || 0,
      };
    }),

  leave: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const community = db.communities.findById(input.communityId);

      if (!community) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comunidade não encontrada",
        });
      }

      if (!community.memberIds.includes(ctx.userId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não é membro desta comunidade",
        });
      }

      if (community.creatorId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O criador não pode sair da comunidade",
        });
      }

      const updated = db.communities.removeMember(input.communityId, ctx.userId);

      console.log(`👥 Usuário ${ctx.userId} saiu da comunidade ${input.communityId}`);

      return {
        community: updated,
        memberCount: updated?.memberIds.length || 0,
      };
    }),
});
