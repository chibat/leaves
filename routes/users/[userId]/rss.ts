import { defineRoute } from "$fresh/server.ts";
import { selectUser, selectUserPost } from "~/server/db.ts";
import { getTitle } from "~/server/getTitle.ts";

// RSS をレスポンスする
export default defineRoute(async (req, ctx) => {
  const pageUser = await selectUser(ctx.params.userId);
  if (!pageUser) {
    return ctx.renderNotFound();
  }
  const picture = pageUser.picture ?? undefined;
  const title = `${pageUser.name} - Leaves`;
  const posts = await selectUserPost({
    userId: pageUser.id,
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${title}</title>
    <link>https://leaves.chiba.dev/users/${ctx.params.userId}</link>
    <description>${title}</description>
    <image>
      <url>https://leaves.chiba.dev/favicon.ico</url>
    </image>
    ${posts.map((post) => `
    <item>
      <title>${getTitle(post.source) + ' | ' + title}</title>
      <link>https://leaves.chiba.dev/posts/${post.id}</link>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>${post.id}</guid>
      <description>
${escapeXml(post.source)}
      </description>
    </item>
    `
    ).join("")}
  </channel>
</rss>`
    ,
    { headers: { "Content-Type": "application/xml; charset=UTF-8" } },
  );
});

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
