import { defineHandler } from "void";
import type { InferProps } from "void";
import { getTitle } from "~/server/getTitle.ts";
import { getSession } from "~/server/auth.ts";
import { selectPost } from "~/server/db.ts";

export const loader = defineHandler(async (c) => {
  const postId = Number(c.req.param("postId"));
  const post = Number.isSafeInteger(postId) && postId > 0
    ? await selectPost(postId)
    : null;
  if (!post) c.status(404);
  const session = await getSession(c.req.raw);
  if (post?.draft && post.user_id !== session?.user.id) {
    return c.redirect("/", 307);
  }
  const title = post ? `${getTitle(post.source)} | Leaves` : "Not Found - Leaves";
  return {
    post,
    postTitle: title,
    userId: session?.user.id,
  };
});

export type Props = InferProps<typeof loader>;
