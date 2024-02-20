import { z } from "zod";
import { publicProcedure } from "../../../plugins/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export default publicProcedure.input(
  z.object({ source: z.string() }),
).query(({ input }) => {
  return render(input.source, {});
});
