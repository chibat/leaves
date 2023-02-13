import { z } from "zod";
import {
  pool,
  Post,
  selectFollowingUsersPosts,
  selectLikes,
  selectPostByLtId,
  selectPosts,
  selectPostsBySearchWord,
  selectPostsBySearchWordAndLtId,
  selectUserPostByLtId,
  selectUserPosts,
} from "~/lib/db.ts";
import { publicProcedure } from "~/trpc/context.ts";
import { getSession } from "~/lib/auth.ts";

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
      if (input.postId) {
        posts = await selectUserPostByLtId(client, {
          ltId: input.postId,
          userId: input.userId,
        });
      } else {
        posts = await selectUserPosts(client, input.userId);
      }
    } else if (input.following && session) {
      // following user only
      const userId = session.user.id;
      if (input.postId) {
        posts = await selectUserPostByLtId(client, {
          ltId: input.postId,
          userId,
        });
      } else {
        posts = await selectFollowingUsersPosts(client, userId);
      }
    } else if (input.searchWord) {
      if (input.postId) {
        posts = await selectPostsBySearchWordAndLtId(client, {
          searchWord: input.searchWord,
          postId: input.postId,
        });
      } else {
        posts = await selectPostsBySearchWord(client, input.searchWord);
      }
    } else {
      // all user
      if (input.postId) {
        posts = await selectPostByLtId(client, input.postId);
      } else {
        posts = await selectPosts(client);
      }
    }

    const likedPostIds = session
      ? await selectLikes(client, {
        userId: session.user.id,
        postIds: posts.map((post) => post.id),
      })
      : [];

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
