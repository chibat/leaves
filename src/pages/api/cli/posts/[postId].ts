import type { APIRoute } from "astro";
import { selectPost } from "../../../../../server/db.ts";

export const GET: APIRoute = async ({ params }) => {
  const postId = Number(params.postId);
  const post = Number.isSafeInteger(postId) && postId > 0
    ? await selectPost(postId)
    : null;
  return Response.json(post ? { source: post.source } : []);
};
