import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { db } from "@/backend/lib/db";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  return {
    req: opts.req,
    token: token || null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar autenticado",
    });
  }

  const session = db.sessions.findByToken(ctx.token);
  
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sessão inválida ou expirada",
    });
  }

  return next({
    ctx: {
      ...ctx,
      token: ctx.token,
      userId: session.userId,
    },
  });
});
