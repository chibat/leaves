import { defineHandler } from "void";
import type { InferProps } from "void";
import { selectPost, updatePost } from "~/server/db.ts";
import { z } from "zod";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  if (!session) throw new Error("Missing session for protected page");
  const postId = Number(c.req.param("postId"));
  const post =
    Number.isSafeInteger(postId) && postId > 0 ? await selectPost(postId) : null;
  if (!post) c.status(404);
  if (post && post.user_id !== session.user.id) {
    return c.redirect("/", 307);
  }
  return { post };
});

export const actions = {
  update: defineHandler.withValidator({
    params: z.object({ postId: z.coerce.number().int().positive() }),
    body: z.object({
      source: z.string().max(10000),
      draft: z.boolean(),
    }),
  })(async (c, { params, body }) => {
    const session = c.get("leavesSession");
    if (!session) return c.redirect("/auth", 303);
    const post = await selectPost(params.postId);
    if (!post || post.user_id !== session.user.id) {
      return c.redirect("/", 303);
    }
    await updatePost({
      postId: params.postId,
      userId: session.user.id,
      source: body.source,
      draft: body.draft,
    });
    return c.redirect(`/posts/${params.postId}?updated`, 303);
  }),
};

export type Props = InferProps<typeof loader>;
