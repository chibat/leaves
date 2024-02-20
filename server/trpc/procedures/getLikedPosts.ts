import { z } from "zod";
import { getSession } from "~/server/auth.ts";
import { selectLikedPosts } from "~/server/db.ts";
import { publicProcedure } from "~/plugins/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export default publicProcedure.input(
  z.object({
    postId: z.number().nullable(),
  }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return [];
  }
  const user = session.user;

  const posts = (await selectLikedPosts({
    userId: user.id,
    ltId: input.postId,
  })).map((post) => {
    return { ...post, source: render(post.source) };
  });

  return posts.map((p) => {
    return {
      id: p.id,
      user_id: p.user_id,
      source: p.source,
      updated_at: p.updated_at,
      created_at: p.created_at,
      comments: p.comments,
      name: p.name,
      picture: p.picture,
      likes: p.likes,
      liked: true,
      draft: p.draft,
    };
  });
});
