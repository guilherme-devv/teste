import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { verificationRouter } from "./routes/verification";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import { sharesRouter } from "./routes/shares";
import { educationalRouter } from "./routes/educational";
import { diaryRouter } from "./routes/diary";
import { communitiesRouter } from "./routes/communities";
import { chatRouter } from "./routes/chat";
import { localServicesRouter } from "./routes/local-services";
import { rewardsRouter } from "./routes/rewards";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  verification: verificationRouter,
  posts: postsRouter,
  comments: commentsRouter,
  shares: sharesRouter,
  educational: educationalRouter,
  diary: diaryRouter,
  communities: communitiesRouter,
  chat: chatRouter,
  localServices: localServicesRouter,
  rewards: rewardsRouter,
});

export type AppRouter = typeof appRouter;
