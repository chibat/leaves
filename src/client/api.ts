import { fetch as voidFetch } from "void/client";

export const api = {
  cancelLike: ({ postId }: { postId: number }) =>
    voidFetch("/api/posts/[postId]/like", {
      method: "DELETE",
      params: { postId },
    }),
  createComment: (
    { postId, source }: { postId: number; source: string },
  ) =>
    voidFetch("/api/posts/[postId]/comments", {
      method: "POST",
      params: { postId },
      body: { source },
    }),
  createFollow: ({ followingUserId }: { followingUserId: number }) =>
    voidFetch("/api/users/[userId]/follow", {
      method: "POST",
      params: { userId: followingUserId },
    }),
  createLike: ({ postId }: { postId: number }) =>
    voidFetch("/api/posts/[postId]/like", {
      method: "POST",
      params: { postId },
    }),
  deleteComment: ({ commentId }: { commentId: number }) =>
    voidFetch("/api/comments/[commentId]", {
      method: "DELETE",
      params: { commentId },
    }),
  deleteFollow: ({ followingUserId }: { followingUserId: number }) =>
    voidFetch("/api/users/[userId]/follow", {
      method: "DELETE",
      params: { userId: followingUserId },
    }),
  deletePost: ({ postId }: { postId: number }) =>
    voidFetch("/api/posts/[postId]", {
      method: "DELETE",
      params: { postId },
    }),
  getComments: ({ postId }: { postId: number }) =>
    voidFetch("/api/posts/[postId]/comments", {
      params: { postId },
    }),
  getFollowInfo: ({ userId }: { userId: number }) =>
    voidFetch("/api/users/[userId]/follow", {
      params: { userId },
    }),
  getFollowerUsers: ({ userId }: { userId: number }) =>
    voidFetch("/api/users/[userId]/followers", {
      params: { userId },
    }),
  getFollowingUsers: ({ userId }: { userId: number }) =>
    voidFetch("/api/users/[userId]/following", {
      params: { userId },
    }),
  getLikeUsers: ({ postId }: { postId: number }) =>
    voidFetch("/api/posts/[postId]/likes", {
      params: { postId },
    }),
  getLikedPosts: ({ postId }: { postId: number | null }) =>
    voidFetch("/api/posts/liked", {
      query: postId === null ? {} : { postId },
    }),
  getPosts: (input: {
    postId: number | null;
    userId?: number;
    following?: boolean;
    searchWord?: string;
  }) =>
    voidFetch("/api/posts", {
      query: {
        ...(input.postId === null ? {} : { postId: input.postId }),
        ...(input.userId === undefined ? {} : { userId: input.userId }),
        ...(input.following ? { following: "true" } : {}),
        ...(input.searchWord === undefined
          ? {}
          : { searchWord: input.searchWord }),
      },
    }),
  isLiked: async ({ postId }: { postId: number }) =>
    (await voidFetch("/api/posts/[postId]/like", {
      params: { postId },
    })).liked,
  md2html: ({ source }: { source: string }) =>
    voidFetch("/api/markdown", {
      method: "POST",
      body: { source },
    }),
};
