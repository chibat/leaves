import { defineHandler } from "void";
import type { InferProps } from "void";
import { getPagePosts } from "~/server/page_posts.ts";
import { selectUser } from "~/server/db.ts";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  const userId = c.req.param("userId") ?? "";
  const pageUser = await selectUser(userId);
  if (!pageUser) c.status(404);
  const posts = pageUser
    ? await getPagePosts(session, { userId: pageUser.id })
    : [];
  return {
    pageUser,
    posts,
    loginUserId: session?.user.id,
    title: pageUser ? `${pageUser.name} - Leaves` : "Not Found - Leaves",
    rssUrl: `https://leaves.chiba.dev/users/${userId}/rss`,
  };
});

export type Props = InferProps<typeof loader>;
