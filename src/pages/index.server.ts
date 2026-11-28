import { defineHandler } from "void";
import type { InferProps } from "void";
import { getPagePosts } from "~/server/page_posts.ts";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  return {
    session,
    posts: await getPagePosts(session),
    title: "Leaves - Microblog with Markdown",
  };
});

export type Props = InferProps<typeof loader>;
