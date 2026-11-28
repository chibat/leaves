import { defineHandler } from "void";
import type { InferProps } from "void";
import { getPagePosts } from "~/server/page_posts.ts";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  const searchWord = new URL(c.req.url).searchParams.get("value") ?? "";
  const posts = searchWord
    ? await getPagePosts(session, { searchWord })
    : undefined;
  return {
    searchWord,
    posts,
    loginUserId: session?.user.id,
    title: `Search:${searchWord} - Leaves`,
  };
});

export type Props = InferProps<typeof loader>;
