import type { APIRoute } from "astro";
import { getAuthUrl, getSession } from "../../server/auth.ts";

export const GET: APIRoute = async ({ request }) => {
  if (await getSession(request)) {
    return new Response(null, { status: 307, headers: { Location: "/" } });
  }
  return Response.redirect(getAuthUrl(request.url));
};
