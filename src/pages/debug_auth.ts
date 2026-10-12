import type { APIRoute } from "astro";
import { createSession } from "../../server/auth.ts";

export const GET: APIRoute = async () => {
  if (
    !import.meta.env.DEV ||
    !process.env.HOSTNAME?.startsWith("codespaces-")
  ) {
    return new Response("Not Found", { status: 404 });
  }
  const response = new Response(
    "<script>location.href = '/';</script>",
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
  await createSession(response, 1);
  return response;
};
