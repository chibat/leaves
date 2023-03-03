import { z } from "zod";
import { getSession } from "~/lib/auth.ts";
import {
  pool,
  selectLikedPosts,
  selectLikedPostsByLtId,
  selectLikes,
} from "~/lib/db.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const getLikedPosts = publicProcedure.input(
  z.object({
    postId: z.number().optional(),
  }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const user = session.user;

  const { posts, likedPostIds } = await pool(async (client) => {
    let posts;
    if (input.postId) {
      posts = await selectLikedPostsByLtId(client, {
        userId: user.id,
        ltId: input.postId,
      });
    } else {
      posts = await selectLikedPosts(client, user.id);
    }

    const likedPostIds = await selectLikes(client, {
      userId: user.id,
      postIds: posts.map((post) => post.id),
    });

    return { posts, likedPostIds };
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
    };
  });
});
