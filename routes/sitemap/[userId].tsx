import { defineRoute } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { selectUserPostIds } from "~/server/db.ts";

export default defineRoute(async (_req, ctx) => {
  const userId = Number(ctx.params.userId);
  const postIds = await selectUserPostIds(userId);
  return (
    <>
      <Head>
        <title>Sitemap Posts - Leaves</title>
      </Head>
      <main class="container" style={{ wordBreak: "break-word" }}>
        <h1>Sitemap Posts</h1>
        {postIds.map((postId) => (
          <>
            <a href={`/posts/${postId}`}>
              {postId}
            </a>&nbsp;
          </>
        ))}
      </main>
    </>
  );
});
