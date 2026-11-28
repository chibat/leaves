import type { getSession } from "./auth.ts";
import type { GetPostsOutput } from "~/common/types.ts";
import { getPosts, getLikedPosts } from "~/server/queries.ts";

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
  if (query.liked) {
    return session ? await getLikedPosts(session.user.id, null) : [];
  }
  return getPosts(session, { postId: null, ...query });
}
