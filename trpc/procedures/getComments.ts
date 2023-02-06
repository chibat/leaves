import { z } from "zod";
import { pool, selectComments } from "~/lib/db.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const getComments = publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input }) => {
  const postId = input.postId;
  return await pool((client) => selectComments(client, postId));
});
