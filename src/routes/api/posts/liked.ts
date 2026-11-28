import { defineHandler } from "void";
import { z } from "zod";
import { getLikedPosts } from "~/server/queries.ts";

const querySchema = z.object({
  postId: z.coerce.number().int().positive().optional(),
});

export const GET = defineHandler.withValidator({ query: querySchema })(
  (c, { query }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    return getLikedPosts(session.user.id, query.postId ?? null);
  },
);
