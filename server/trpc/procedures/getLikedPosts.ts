import { z } from "zod";
import { getSession } from "~/server/auth.ts";
import { pool, selectLikedPosts, selectLikes } from "~/server/db.ts";
import { publicProcedure } from "~/server/trpc/context.ts";
import { render } from "~/server/markdown.ts";

export const getLikedPosts = publicProcedure.input(
  z.object({
    postId: z.number().nullable(),
  }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return [];
  }
  const user = session.user;

  const { posts, likedPostIds } = await pool(async (client) => {
    const posts = await selectLikedPosts({
      userId: user.id,
      ltId: input.postId,
    });

    const likedPostIds = await selectLikes(client, {
      userId: user.id,
      postIds: posts.map((post) => post.id),
    });

    return {
      posts: posts.map((post) => {
        return { ...post, source: render(post.source) };
      }),
      likedPostIds,
    };
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
      liked: likedPostIds.includes(p.id),
      draft: p.draft,
    };
  });
});
