import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { verificationRouter } from "./routes/verification";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import { sharesRouter } from "./routes/shares";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  verification: verificationRouter,
  posts: postsRouter,
  comments: commentsRouter,
  shares: sharesRouter,
});

export type AppRouter = typeof appRouter;
