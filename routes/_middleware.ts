import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { pool, selectPostIds, selectUsers } from "~/lib/db.ts";

export async function handler(
  _req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const resp = await ctx.next();
  if (resp.status === 500) {
    const contentType = resp.headers.get("content-type") || "text/plain";
    return new Response("503 Service Unavailable", {
      status: 503,
      headers: { "content-type": contentType },
    });
  }
  const url = new URL(_req.url);
  if (url.pathname === "/sitemap.xml") {
    const [users, posts] = await pool(async (client) => {
      const users = await selectUsers(client);
      const posts = await selectPostIds(client);
      return [users, posts];
    });
    const baseUrl = `${url.protocol}//${url.hostname}${
      url.hostname === "localhost" ? (":" + url.port) : ""
    }`;

    return new Response(
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
        users.map((user) =>
          `<sitemap><loc>${baseUrl}/users/${user.user_id}</loc><lastmod>${
            new Date(user.updated_at).toISOString()
          }</lastmod></sitemap>`
        ).join() + posts.map((post) =>
          `<sitemap><loc>${baseUrl}/posts/${post.id}</loc><lastmod>${
            new Date(post.updated_at).toISOString()
          }</lastmod></sitemap>`
        )
      }</sitemapindex>`,
      {
        headers: { "content-type": 'application/xml; charset="UTF-8"' },
      },
    );
  }
  return resp;
}
