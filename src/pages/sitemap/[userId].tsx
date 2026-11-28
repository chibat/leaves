import type { Props } from "./[userId].server.ts";
import { Link } from "@void/react";

export default function SitemapPosts({ postIds }: Props) {
  return (
    <>
      <title>Sitemap Posts - Leaves</title>
      <main className="container" style={{ wordBreak: "break-word" }}>
        <h1>Sitemap Posts</h1>
        {postIds
          ? postIds.map((postId) => (
            <span key={postId}>
              <Link href={`/posts/${postId}`}>{postId}</Link>&nbsp;
            </span>
          ))
          : <h2>404 Not Found</h2>}
      </main>
    </>
  );
}
