import { z } from "zod";
import { publicProcedure, router } from "./context.ts";
import { getComments } from "~/server/trpc/procedures/getComments.ts";
import { createComment } from "~/server/trpc/procedures/createComment.ts";
import { getPosts } from "~/server/trpc/procedures/getPosts.ts";
import { getFollowInfo } from "~/server/trpc/procedures/getFollowInfo.ts";
import { getFollowerUsers } from "~/server/trpc/procedures/getFollowerUsers.ts";
import { getLikeUsers } from "~/server/trpc/procedures/getLikeUsers.ts";
import { isLiked } from "~/server/trpc/procedures/isLiked.ts";
import { getLikedPosts } from "~/server/trpc/procedures/getLikedPosts.ts";
import { getSession } from "~/server/trpc/procedures/getSession.ts";
import { createLike } from "~/server/trpc/procedures/createLike.ts";
import { createFollow } from "~/server/trpc/procedures/createFollow.ts";
import { createPost } from "~/server/trpc/procedures/createPost.ts";
import { cancelLike } from "~/server/trpc/procedures/cancelLike.ts";
import { deleteComment } from "~/server/trpc/procedures/deleteComment.ts";
import { deletePost } from "~/server/trpc/procedures/deletePost.ts";
import { deleteFollow } from "~/server/trpc/procedures/deleteFollow.ts";
import { updatePost } from "~/server/trpc/procedures/updatePost.ts";
import { md2html } from "~/server/trpc/procedures/md2html.ts";
import { getFollowingUsers } from "~/server/trpc/procedures/getFollowingUsers.ts";
import { deleteUser } from "~/server/trpc/procedures/deleteUser.ts";

const posts = [{ name: "first post" }];

export const appRouter = router({
  createComment,
  createFollow,
  createLike,
  createPost,
  cancelLike,
  deleteComment,
  deletePost,
  deleteUser,
  deleteFollow,
  getComments,
  getPosts,
  getFollowInfo,
  getFollowerUsers,
  getFollowingUsers,
  getLikeUsers,
  getSession,
  isLiked,
  getLikedPosts,
  updatePost,
  md2html,
  postGet: publicProcedure.query(() => posts),
  postCreate: publicProcedure.input(z.object({
    name: z.string(),
  })).mutation((req) => {
    posts.push(req.input);
    return req.input;
  }),
});

export type AppRouter = typeof appRouter;
