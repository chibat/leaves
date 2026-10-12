import type { APIRoute } from "astro";
import { getSession } from "../../server/auth.ts";
import { deleteSession } from "../../server/db.ts";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (session) await deleteSession(session);
  const response = new Response(null, {
    status: 307,
    headers: { Location: "/" },
  });
  response.headers.append(
    "Set-Cookie",
    "session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
  );
  return response;
};
