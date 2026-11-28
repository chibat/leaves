import { defineHandler } from "void";
import type { InferProps } from "void";
import { getPagePosts } from "~/server/page_posts.ts";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  if (!session) throw new Error("Missing session for protected page");
  return {
    loginUserId: session.user.id,
    posts: await getPagePosts(session, { following: true }),
  };
});

export type Props = InferProps<typeof loader>;
