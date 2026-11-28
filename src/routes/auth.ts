import { defineHandler } from "void";
import {
  createOAuthState,
  getAuthUrl,
  getOAuthStateCookie,
  getSession,
} from "~/server/auth.ts";

export const GET = defineHandler(async (c) => {
  const request = c.req.raw;
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
});
