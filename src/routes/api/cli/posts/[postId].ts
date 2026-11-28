import { defineHandler } from "void";
import { selectPost } from "~/server/db.ts";

export const GET = defineHandler(async (c) => {
  const postId = Number(c.req.param("postId"));
  const post = Number.isSafeInteger(postId) && postId > 0
    ? await selectPost(postId)
    : null;
  if (!post || post.draft) {
    return c.json({ error: "Not Found" }, 404);
  }
  return c.json({ source: post.source });
});
