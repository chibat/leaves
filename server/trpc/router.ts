import { z } from "zod";
import { publicProcedure, router } from "./context.ts";
import { getComments } from "./procedures/getComments.ts";
import { createComment } from "./procedures/createComment.ts";
import { getPosts } from "./procedures/getPosts.ts";
import { getFollowInfo } from "./procedures/getFollowInfo.ts";
import { getFollowerUsers } from "./procedures/getFollowerUsers.ts";
import { getLikeUsers } from "./procedures/getLikeUsers.ts";
import { isLiked } from "./procedures/isLiked.ts";
import { getLikedPosts } from "./procedures/getLikedPosts.ts";
import { getSession } from "./procedures/getSession.ts";
import { createLike } from "./procedures/createLike.ts";
import { createFollow } from "./procedures/createFollow.ts";
import { createPost } from "./procedures/createPost.ts";
import { cancelLike } from "./procedures/cancelLike.ts";
import { deleteComment } from "./procedures/deleteComment.ts";
import { deletePost } from "./procedures/deletePost.ts";
import { deleteFollow } from "./procedures/deleteFollow.ts";
import { updatePost } from "./procedures/updatePost.ts";
import { md2html } from "./procedures/md2html.ts";

const posts = [{ name: "first post" }];

export const appRouter = router({
  createComment,
  createFollow,
  createLike,
  createPost,
  cancelLike,
  deleteComment,
  deletePost,
  deleteFollow,
  getComments,
  getPosts,
  getFollowInfo,
  getFollowerUsers,
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
