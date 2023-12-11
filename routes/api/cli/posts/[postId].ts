import { defineRoute } from "$fresh/server.ts";
import { selectPost } from "~/server/db.ts";

export default defineRoute(async (_req, ctx) => {
  const postId = Number(ctx.params.postId);
  const post = await selectPost(postId);
  if (!post) {
    return Response.json([]);
  }
  return Response.json({ source: post.source });
});
