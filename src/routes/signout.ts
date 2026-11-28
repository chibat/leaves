import { defineHandler } from "void";
import { getSession } from "~/server/auth.ts";
import { deleteSession } from "~/server/db.ts";

export const GET = defineHandler(async (c) => {
  const session = await getSession(c.req.raw);
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
});
