import type { APIRoute } from "astro";
import { selectPost } from "~/server/db.ts";

export const GET: APIRoute = async ({ params }) => {
  const postId = Number(params.postId);
  const post = Number.isSafeInteger(postId) && postId > 0
    ? await selectPost(postId)
    : null;
  if (!post || post.draft) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json({ source: post.source });
};
