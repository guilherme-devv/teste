import * as z from "zod";

import { db } from "@/backend/lib/db";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const BADGES = [
  { id: "first_post", name: "Primeira Postagem", description: "Fez sua primeira postagem", requiredPoints: 0 },
  { id: "social_butterfly", name: "Borboleta Social", description: "Fez 10 comentários", requiredPoints: 0 },
  { id: "helpful", name: "Prestativo", description: "Recebeu 50 curtidas", requiredPoints: 0 },
  { id: "diary_keeper", name: "Guardião do Diário", description: "Criou 10 entradas no diário", requiredPoints: 0 },
  { id: "level_5", name: "Nível 5", description: "Alcançou o nível 5", requiredPoints: 500 },
  { id: "level_10", name: "Nível 10", description: "Alcançou o nível 10", requiredPoints: 1000 },
];

export const rewardsRouter = createTRPCRouter({
  getMyRewards: protectedProcedure
    .query(async ({ ctx }) => {
      let reward = db.userRewards.findByUserId(ctx.userId);

      if (!reward) {
        reward = db.userRewards.create({
          id: crypto.randomUUID(),
          userId: ctx.userId,
          points: 0,
          level: 1,
          badges: [],
          activities: [],
          updatedAt: new Date(),
        });
      }

      const nextLevelPoints = reward.level * 100;
      const currentLevelPoints = (reward.level - 1) * 100;
      const progressToNextLevel = ((reward.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

      const availableBadges = BADGES.map((badge) => ({
        ...badge,
        earned: reward!.badges.includes(badge.id),
      }));

      return {
        ...reward,
        nextLevelPoints,
        progressToNextLevel: Math.min(progressToNextLevel, 100),
        availableBadges,
      };
    }),

  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }).optional(),
    )
    .query(async ({ input }) => {
      const allRewards = db.users.getAll().map((user) => {
        const reward = db.userRewards.findByUserId(user.id);
        return {
          userId: user.id,
          userName: user.name,
          points: reward?.points || 0,
          level: reward?.level || 1,
          badges: reward?.badges || [],
        };
      });

      const sorted = allRewards.sort((a, b) => b.points - a.points);
      const limited = sorted.slice(0, input?.limit || 10);

      return {
        leaderboard: limited,
      };
    }),

  checkAndAwardBadges: protectedProcedure
    .mutation(async ({ ctx }) => {
      const reward = db.userRewards.findByUserId(ctx.userId);
      if (!reward) return { newBadges: [] };

      const posts = db.posts.findByUserId(ctx.userId);
      const diaryEntries = db.diaryEntries.findByUserId(ctx.userId);

      const newBadges: string[] = [];

      if (posts.length >= 1 && !reward.badges.includes("first_post")) {
        db.userRewards.addBadge(ctx.userId, "first_post");
        newBadges.push("first_post");
      }

      if (diaryEntries.length >= 10 && !reward.badges.includes("diary_keeper")) {
        db.userRewards.addBadge(ctx.userId, "diary_keeper");
        newBadges.push("diary_keeper");
      }

      if (reward.level >= 5 && !reward.badges.includes("level_5")) {
        db.userRewards.addBadge(ctx.userId, "level_5");
        newBadges.push("level_5");
      }

      if (reward.level >= 10 && !reward.badges.includes("level_10")) {
        db.userRewards.addBadge(ctx.userId, "level_10");
        newBadges.push("level_10");
      }

      return { newBadges };
    }),
});
