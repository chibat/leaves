import { z } from "zod";
import { inferProcedureOutput } from "@trpc/server";
import {
  PostViewType,
  selectFollowingUsersPosts,
  selectLikes,
  selectPosts,
  selectPostsBySearchWord,
  selectUserPost,
} from "~/server/db.ts";
import { publicProcedure } from "~/server/trpc/context.ts";
import { getSession } from "~/server/auth.ts";
import { render } from "~/server/markdown.ts";

export const getPosts = publicProcedure.input(
  z.object({
    postId: z.number().nullable(),
    userId: z.number().optional(),
    following: z.boolean().optional(),
    searchWord: z.string().optional(),
  }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);

  let posts: PostViewType[] = [];
  if (input.userId) {
    // specified user only
    posts = await selectUserPost({
      userId: input.userId,
      self: input.userId === session?.user.id,
      ltId: input.postId,
    });
  } else if (input.following && session) {
    // following user only
    const userId = session.user.id;
    posts = await selectFollowingUsersPosts({ userId, ltId: input.postId });
  } else if (input.searchWord) {
    posts = await selectPostsBySearchWord({
      searchWord: input.searchWord,
      postId: input.postId,
      loginUserId: session ? session.user.id : null,
    });
  } else {
    // all user
    posts = await selectPosts(input.postId);
  }

  const likedPostIds = session
    ? await selectLikes({
      userId: session.user.id,
      postIds: posts.map((post) => post.id),
    })
    : [];

  return posts.map((p) => {
    return {
      id: p.id,
      user_id: p.user_id,
      source: render(p.source),
      updated_at: p.updated_at,
      created_at: p.created_at,
      comments: p.comments,
      name: p.name,
      picture: p.picture,
      likes: p.likes,
      liked: likedPostIds.includes(p.id),
      draft: p.draft,
      account: p.account,
    };
  });
});

export type GetPostsOutput = (inferProcedureOutput<typeof getPosts>)[number];
