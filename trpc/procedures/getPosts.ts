import { z } from "zod";
import {
  pool,
  Post,
  selectFollowingUsersPosts,
  selectLikes,
  selectPosts,
  selectPostsBySearchWord,
  selectUserPost,
} from "~/lib/db.ts";
import { publicProcedure } from "~/trpc/context.ts";
import { getSession } from "~/lib/auth.ts";
import { render } from "~/lib/markdown.ts";

export const getPosts = publicProcedure.input(
  z.object({
    postId: z.number().optional(),
    userId: z.number().optional(),
    following: z.boolean().optional(),
    searchWord: z.string().optional(),
  }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);

  const { posts, likedPostIds } = await pool(async (client) => {
    let posts: Post[] = [];
    if (input.userId) {
      // specified user only
      posts = await selectUserPost(client, {
        userId: input.userId,
        self: input.userId === session?.user.id,
        ltId: input.postId,
      });
    } else if (input.following && session) {
      // following user only
      const userId = session.user.id;
      posts = await selectFollowingUsersPosts(client, {
        userId,
        ltId: input.postId,
      });
    } else if (input.searchWord) {
      posts = await selectPostsBySearchWord(client, {
        searchWord: input.searchWord,
        postId: input.postId,
        loginUserId: session?.user.id,
      });
    } else {
      // all user
      posts = await selectPosts(client, input.postId);
    }

    const likedPostIds = session
      ? await selectLikes(client, {
        userId: session.user.id,
        postIds: posts.map((post) => post.id),
      })
      : [];

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
