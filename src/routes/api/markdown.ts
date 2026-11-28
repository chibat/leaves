import { defineHandler } from "void";
import { z } from "zod";
import { getMarkdownPreview } from "~/server/queries.ts";

export const POST = defineHandler.withValidator({
  body: z.object({ source: z.string() }),
})((_c, { body }) => getMarkdownPreview(body.source));
