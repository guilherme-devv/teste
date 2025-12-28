import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const sampleArticles = [
  {
    title: "Primeiros passos: Alimentação saudável para bebês",
    content: "A alimentação é fundamental nos primeiros meses de vida. O leite materno é o alimento ideal até os 6 meses, fornecendo todos os nutrientes necessários. Após esse período, inicie a introdução alimentar com frutas amassadas, papinhas de legumes e proteínas...",
    category: "alimentação" as const,
    author: "Dra. Maria Silva",
    readTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800",
  },
  {
    title: "Marcos do desenvolvimento: 0-12 meses",
    content: "Cada bebê se desenvolve no seu próprio ritmo, mas existem marcos importantes a observar. Aos 3 meses, o bebê já consegue sustentar a cabeça. Aos 6 meses, senta com apoio. Aos 9 meses, engatinha e aos 12 meses, muitos já dão os primeiros passos...",
    category: "desenvolvimento" as const,
    author: "Dr. João Santos",
    readTime: 8,
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
  },
  {
    title: "Vacinação infantil: Tudo que você precisa saber",
    content: "As vacinas são essenciais para proteger seu filho de doenças graves. O calendário de vacinação começa logo ao nascer com BCG e Hepatite B. Mantenha a carteira de vacinação sempre atualizada e não pule nenhuma dose...",
    category: "saúde" as const,
    author: "Dra. Ana Costa",
    readTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800",
  },
  {
    title: "Como lidar com birras e comportamento",
    content: "Birras são normais no desenvolvimento infantil, geralmente entre 1-3 anos. É a forma da criança expressar frustração. Mantenha a calma, valide os sentimentos da criança, mas seja firme com os limites. Evite ceder à birra...",
    category: "comportamento" as const,
    author: "Psicóloga Carla Mendes",
    readTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
  },
  {
    title: "Preparando seu filho para a escola",
    content: "A transição para a escola é um marco importante. Prepare seu filho conversando sobre a escola, visitando o local com antecedência, estabelecendo rotinas e incentivando a independência. Mostre entusiasmo para transmitir confiança...",
    category: "educação" as const,
    author: "Pedagoga Laura Oliveira",
    readTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  },
];

export const educationalRouter = createTRPCRouter({
  seedArticles: protectedProcedure
    .mutation(async () => {
      const existingArticles = db.articles.getAll();
      if (existingArticles.length > 0) {
        return { message: "Artigos já existem", count: existingArticles.length };
      }

      sampleArticles.forEach((article) => {
        db.articles.create({
          id: crypto.randomUUID(),
          ...article,
          likes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      console.log(`📚 ${sampleArticles.length} artigos criados`);

      return { message: "Artigos criados com sucesso", count: sampleArticles.length };
    }),

  getArticles: protectedProcedure
    .input(
      z.object({
        category: z.enum(["alimentação", "saúde", "desenvolvimento", "educação", "comportamento"]).optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const articles = db.articles.getAll(input?.category);

      return {
        articles,
      };
    }),

  getArticleById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const article = db.articles.findById(input.id);

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artigo não encontrado",
        });
      }

      return article;
    }),

  toggleLike: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const article = db.articles.findById(input.articleId);

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artigo não encontrado",
        });
      }

      const updated = db.articles.toggleLike(input.articleId, ctx.userId);
      const isLiked = updated?.likes.includes(ctx.userId) || false;

      db.userRewards.addActivity(ctx.userId, "like", 1);

      return {
        article: updated,
        isLiked,
        likesCount: updated?.likes.length || 0,
      };
    }),
});
