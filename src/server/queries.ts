import {
  judgeFollowing,
  selectComments,
  selectCountFollower,
  selectCountFollowing,
  selectFollowerUsers,
  selectFollowingUsers,
  selectFollowingUsersPosts,
  selectLikeUsers,
  selectLikedPosts,
  selectLikes,
  selectPosts,
  selectPostsBySearchWord,
  selectUserPost,
} from "~/server/db.ts";
import type { SessionType } from "~/server/auth.ts";
import { defaultString } from "~/common/utils.ts";
import type { GetPostsOutput, User } from "~/common/types.ts";
import { render } from "~/server/markdown.ts";

type PostQuery = {
  postId: number | null;
  userId?: number;
  following?: boolean;
  searchWord?: string;
};

async function withPostSources(
  posts: Awaited<ReturnType<typeof selectPosts>>,
  session: SessionType | undefined,
): Promise<GetPostsOutput[]> {
  const likedPostIds = session
    ? await selectLikes({
      userId: session.user.id,
      postIds: posts.map((post) => post.id),
    })
    : [];
  return posts.map((post) => ({
    id: post.id,
    user_id: post.user_id,
    source: render(post.source),
    updated_at: post.updated_at,
    created_at: post.created_at,
    comments: post.comments,
    name: post.name,
    picture: post.picture,
    likes: post.likes,
    liked: likedPostIds.includes(post.id),
    draft: post.draft,
    account: post.account,
  }));
}

export async function getPosts(
  session: SessionType | undefined,
  query: PostQuery,
): Promise<GetPostsOutput[]> {
  let posts: Awaited<ReturnType<typeof selectPosts>>;
  if (query.userId) {
    posts = await selectUserPost({
      userId: query.userId,
      self: query.userId === session?.user.id,
      ltId: query.postId,
    });
  } else if (query.following && session) {
    posts = await selectFollowingUsersPosts({
      userId: session.user.id,
      ltId: query.postId,
    });
  } else if (query.searchWord) {
    posts = await selectPostsBySearchWord({
      searchWord: query.searchWord,
      postId: query.postId,
      loginUserId: session?.user.id ?? null,
    });
  } else {
    posts = await selectPosts(query.postId);
  }
  return withPostSources(posts, session);
}

export async function getLikedPosts(
  userId: number,
  postId: number | null,
): Promise<GetPostsOutput[]> {
  const posts = await selectLikedPosts({ userId, ltId: postId });
  return posts.map((post) => ({
    id: post.id,
    user_id: post.user_id,
    source: render(post.source),
    updated_at: post.updated_at,
    created_at: post.created_at,
    comments: post.comments,
    name: post.name,
    picture: post.picture,
    likes: post.likes,
    liked: true,
    draft: post.draft,
    account: post.account,
  }));
}

export async function getComments(postId: number) {
  const rows = await selectComments(postId);
  return rows.map((row) => ({ ...row, source: render(row.source) }));
}

export type GetCommentsOutput = Awaited<ReturnType<typeof getComments>>;

export async function getFollowInfo(
  session: SessionType | undefined,
  userId: number,
) {
  const following = await selectCountFollowing(userId);
  const followers = await selectCountFollower(userId);
  const isFollowing = session
    ? await judgeFollowing({
      userId: session.user.id,
      followingUserId: userId,
    })
    : false;
  return { following, followers, isFollowing };
}

export async function getFollowingUsers(userId: number): Promise<User[]> {
  return (await selectFollowingUsers(userId)).map((user) => ({
    id: user.id,
    name: defaultString(user.name),
    picture: defaultString(user.picture),
  }));
}

export async function getFollowerUsers(userId: number): Promise<User[]> {
  return (await selectFollowerUsers(userId)).map((user) => ({
    id: user.id,
    name: defaultString(user.name),
    picture: defaultString(user.picture),
  }));
}

export async function getLikeUsers(postId: number): Promise<User[]> {
  return (await selectLikeUsers(postId)).map((user) => ({
    id: user.id,
    name: defaultString(user.name),
    picture: defaultString(user.picture),
  }));
}

export async function isLiked(userId: number, postId: number) {
  const postIds = await selectLikes({ userId, postIds: [postId] });
  return postIds.length === 1;
}

export function getMarkdownPreview(source: string) {
  return render(source, {});
}
