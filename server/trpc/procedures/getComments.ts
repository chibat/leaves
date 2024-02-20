import { z } from "zod";
import { selectComments } from "~/server/db.ts";
import { publicProcedure } from "../../../plugins/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export default publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input }) => {
  const postId = input.postId;
  const rows = await selectComments(postId);
  return rows.map((row) => {
    return { ...row, source: render(row.source) };
  });
});
