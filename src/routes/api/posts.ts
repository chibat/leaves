import { defineHandler } from "void";
import { z } from "zod";
import { getPosts } from "~/server/queries.ts";

const querySchema = z.object({
  postId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  following: z.enum(["true", "false"]).transform((value) => value === "true")
    .optional(),
  searchWord: z.string().optional(),
});

export const GET = defineHandler.withValidator({ query: querySchema })(
  (c, { query }) =>
    getPosts(c.get("leavesSession"), {
      ...query,
      postId: query.postId ?? null,
    }),
);
