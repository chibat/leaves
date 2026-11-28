import { defineHandler } from "void";
import { z } from "zod";
import { insertPost } from "~/server/db.ts";

export const action = defineHandler.withValidator({
  body: z.object({
    source: z.string().max(10000),
    draft: z.boolean(),
  }),
})(async (c, { body }) => {
  const session = c.get("leavesSession");
  if (!session) return c.redirect("/auth", 303);
  const postId = await insertPost({
    userId: session.user.id,
    source: body.source,
    draft: body.draft,
  });
  return c.redirect(`/posts/${postId}?posted`, 303);
});
