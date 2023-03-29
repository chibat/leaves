import { z } from "zod";
import { publicProcedure } from "~/trpc/context.ts";
import { render } from "~/lib/markdown.ts";

export const md2html = publicProcedure.input(
  z.object({ source: z.string() }),
).query(({ input }) => {
  return render(input.source, {});
});
