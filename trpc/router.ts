import { z } from "zod";
import { hello } from "~/trpc/procedures/hello.ts";
import { publicProcedure, router } from "~/trpc/context.ts";
import { getComments } from "~/trpc/procedures/getComments.ts";
import { createComment } from "~/trpc/procedures/createComment.ts";
import { getPosts } from "~/trpc/procedures/getPosts.ts";
import { getFollowInfo } from "~/trpc/procedures/getFollowInfo.ts";
import { getFollowerUsers } from "~/trpc/procedures/getFollowerUsers.ts";
import { getLikeUsers } from "~/trpc/procedures/getLikeUsers.ts";
import { isLiked } from "~/trpc/procedures/isLiked.ts";
import { getLikedPosts } from "~/trpc/procedures/getLikedPosts.ts";
import { createLike } from "~/trpc/procedures/createLike.ts";
import { cancelLike } from "~/trpc/procedures/cancelLike.ts";
import { deleteComment } from "~/trpc/procedures/deleteComment.ts";

const posts = [{ name: "first post" }];

export const appRouter = router({
  hello,
  createComment,
  createLike,
  cancelLike,
  deleteComment,
  getComments,
  getPosts,
  getFollowInfo,
  getFollowerUsers,
  getLikeUsers,
  isLiked,
  getLikedPosts,
  postGet: publicProcedure.query(() => posts),
  postCreate: publicProcedure.input(z.object({
    name: z.string(),
  })).mutation((req) => {
    posts.push(req.input);
    return req.input;
  }),
});

export type AppRouter = typeof appRouter;
