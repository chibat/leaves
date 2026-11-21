import type { APIRoute } from "astro";
import {
  createOAuthState,
  getAuthUrl,
  getOAuthStateCookie,
  getSession,
} from "~/server/auth.ts";

export const GET: APIRoute = async ({ request }) => {
  if (await getSession(request)) {
    return new Response(null, { status: 307, headers: { Location: "/" } });
  }
  const state = createOAuthState();
  return new Response(null, {
    status: 302,
    headers: {
      Location: getAuthUrl(request.url, state),
      "Set-Cookie": getOAuthStateCookie(state),
    },
  });
};
