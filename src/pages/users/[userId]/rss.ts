import type { APIRoute } from "astro";
import { getTitle } from "~/server/getTitle.ts";
import { selectUser, selectUserPost } from "~/server/db.ts";

export const GET: APIRoute = async ({ params }) => {
  const userId = params.userId ?? "";
  const pageUser = await selectUser(userId);
  if (!pageUser) return new Response("Not Found", { status: 404 });
  const title = `${pageUser.name} - Leaves`;
  const posts = await selectUserPost({
    userId: pageUser.id,
    self: false,
    ltId: null,
  });
  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://leaves.chiba.dev/users/${escapeXml(userId)}</link>
    <description>${escapeXml(title)}</description>
    <image><url>https://leaves.chiba.dev/favicon.ico</url></image>
    ${posts.map((post) => `
    <item>
      <title>${escapeXml(`${getTitle(post.source)} | ${title}`)}</title>
      <link>https://leaves.chiba.dev/posts/${post.id}</link>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>${post.id}</guid>
      <description>${escapeXml(post.source)}</description>
    </item>`).join("")}
  </channel>
</rss>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=UTF-8" },
  });
};

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return character;
    }
  });
}
