import type { Props } from "./[postId].server.ts";
import PostView from "~/islands/PostView.tsx";

export default function PostPage({ post, postTitle, userId }: Props) {
  return (
    <>
      <title>{postTitle}</title>
      {post && (
        <>
          <meta name="description" content={postTitle} />
          <meta property="og:url" content="https://leaves.chiba.dev/" />
          <meta property="og:title" content={postTitle} />
          <meta
            property="og:description"
            content={post.source.replace(/^#+/, "").replaceAll("```", "").trim().substring(0, 1000).replaceAll("\n", " ")}
          />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@tomofummy" />
          <meta name="twitter:image" content={post.picture ?? ""} />
        </>
      )}
      <main className="container">
        {post
          ? <PostView post={post} postTitle={postTitle} userId={userId} />
          : <h1>404 Not Found</h1>}
      </main>
    </>
  );
}
