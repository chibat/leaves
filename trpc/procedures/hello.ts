import { publicProcedure } from "~/trpc/context.ts";

export const hello = publicProcedure.query(() => "world");
