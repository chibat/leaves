import { defineRoute } from "~/server/route.ts";
import { Head } from "~/server/head.tsx";
import { selectUserPostIds } from "~/server/db.ts";

export default defineRoute(async (_req, ctx) => {
  const userId = Number(ctx.params.userId);
  if (Number.isNaN(userId)) {
    return ctx.renderNotFound();
  }
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
