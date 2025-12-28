import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { verificationRouter } from "./routes/verification";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  verification: verificationRouter,
});

export type AppRouter = typeof appRouter;
