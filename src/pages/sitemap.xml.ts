import type { APIRoute } from "astro";
import { selectPostIds, selectUsers } from "../../server/db.ts";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const [users, posts] = await Promise.all([selectUsers(), selectPostIds()]);
  const baseUrl = `${url.protocol}//${url.hostname}${
    url.hostname === "localhost" ? `:${url.port}` : ""
  }`;
  const userUrls = users.map((user) =>
    `<url><loc>${baseUrl}/users/${user.account ?? user.user_id}</loc><lastmod>${
      new Date(user.updated_at).toISOString()
    }</lastmod></url>`
  ).join("");
  const postUrls = posts.map((post) =>
    `<url><loc>${baseUrl}/posts/${post.id}</loc><lastmod>${
      new Date(post.updated_at).toISOString()
    }</lastmod></url>`
  ).join("");

  return new Response(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${userUrls}${postUrls}</urlset>`,
    { headers: { "content-type": "application/xml; charset=UTF-8" } },
  );
};
