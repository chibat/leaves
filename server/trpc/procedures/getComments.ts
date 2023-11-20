import { z } from "zod";
import { selectComments } from "~/server/db.ts";
import { publicProcedure } from "~/server/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export const getComments = publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input }) => {
  const postId = input.postId;
  const rows = (await selectComments(postId)).data!;
  return rows.map((row) => {
    return { ...row, source: render(row.source) };
  });
});
