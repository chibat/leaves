import { defineHandler } from "void";
import { createSession } from "~/server/auth.ts";

export const GET = defineHandler(async () => {
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
});
