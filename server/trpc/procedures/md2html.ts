import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export const md2html = publicProcedure.input(
  z.object({ source: z.string() }),
).query(({ input }) => {
  return render(input.source, {});
});
