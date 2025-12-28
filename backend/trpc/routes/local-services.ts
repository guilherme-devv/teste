import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const sampleServices = [
  {
    name: "Clínica Pediátrica Dr. Silva",
    category: "pediatra" as const,
    description: "Atendimento pediátrico especializado com mais de 20 anos de experiência",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 3000-0000",
    website: "https://clinicasilva.com.br",
    location: { city: "São Paulo", state: "SP" },
    rating: 4.8,
    reviews: [],
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
  },
  {
    name: "Escola Infantil Pequenos Passos",
    category: "escola" as const,
    description: "Educação infantil com metodologia Montessori e ambiente acolhedor",
    address: "Rua das Flores, 234 - São Paulo, SP",
    phone: "(11) 3100-0000",
    location: { city: "São Paulo", state: "SP" },
    rating: 4.9,
    reviews: [],
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  },
  {
    name: "Parque Ibirapuera",
    category: "parque" as const,
    description: "Grande parque urbano com áreas para crianças, quadras e muito verde",
    address: "Av. Pedro Álvares Cabral - São Paulo, SP",
    location: { city: "São Paulo", state: "SP" },
    rating: 4.7,
    reviews: [],
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
  },
  {
    name: "Bebês & Cia - Loja de Produtos Infantis",
    category: "loja" as const,
    description: "Tudo para seu bebê: roupas, brinquedos, móveis e acessórios",
    address: "Shopping Vila Olímpia - São Paulo, SP",
    phone: "(11) 3200-0000",
    website: "https://bebesecia.com.br",
    location: { city: "São Paulo", state: "SP" },
    rating: 4.6,
    reviews: [],
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800",
  },
];

export const localServicesRouter = createTRPCRouter({
  seedServices: protectedProcedure
    .mutation(async () => {
      const existing = db.localServices.getAll();
      if (existing.length > 0) {
        return { message: "Serviços já existem", count: existing.length };
      }

      sampleServices.forEach((service) => {
        db.localServices.create({
          id: crypto.randomUUID(),
          ...service,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      console.log(`🏪 ${sampleServices.length} serviços criados`);

      return { message: "Serviços criados com sucesso", count: sampleServices.length };
    }),

  getServices: protectedProcedure
    .input(
      z.object({
        category: z.enum(["pediatra", "escola", "parque", "loja", "outro"]).optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      let services = db.localServices.getAll(input?.category);

      if (input?.city && input?.state) {
        services = services.filter(
          (s) => s.location.city === input.city && s.location.state === input.state
        );
      }

      return {
        services,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const service = db.localServices.findById(input.id);

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Serviço não encontrado",
        });
      }

      return service;
    }),
});
