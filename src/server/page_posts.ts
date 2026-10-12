import {
  selectFollowingUsersPosts,
  selectLikedPosts,
  selectLikes,
  selectPosts,
  selectPostsBySearchWord,
  selectUserPost,
} from "./db.ts";
import type { getSession } from "./auth.ts";
import { render } from "./markdown.ts";
import type { GetPostsOutput } from "./trpc/procedures/getPosts.ts";

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

type PagePostQuery = {
  userId?: number;
  following?: boolean;
  liked?: boolean;
  searchWord?: string;
};

export async function getPagePosts(
  session: Session | undefined,
  query: PagePostQuery = {},
): Promise<GetPostsOutput[]> {
  let posts;
  if (query.userId) {
    posts = await selectUserPost({
      userId: query.userId,
      self: query.userId === session?.user.id,
      ltId: null,
    });
  } else if (query.following && session) {
    posts = await selectFollowingUsersPosts({
      userId: session.user.id,
      ltId: null,
    });
  } else if (query.liked && session) {
    posts = await selectLikedPosts({ userId: session.user.id, ltId: null });
  } else if (query.searchWord) {
    posts = await selectPostsBySearchWord({
      searchWord: query.searchWord,
      postId: null,
      loginUserId: session?.user.id ?? null,
    });
  } else {
    posts = await selectPosts(null);
  }

  const likedIds = session
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
    liked: likedIds.includes(post.id),
    draft: post.draft,
    account: post.account,
  }));
}
