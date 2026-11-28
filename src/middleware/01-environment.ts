import { defineMiddleware } from "void";
import { getSession, type SessionType } from "~/server/auth.ts";

declare module "void" {
  interface CloudContextVariables {
    leavesSession: SessionType | undefined;
    shared: {
      user?: SessionType["user"];
      authUrl?: string;
    };
  }
}

const protectedPaths = new Set([
  "/following",
  "/likes",
  "/notification",
  "/settings",
  "/posts/new",
]);

export default defineMiddleware(async (c, next) => {
  const session = await getSession(c.req.raw);
  c.set("leavesSession", session);
  c.set("shared", {
    user: session?.user,
    authUrl: session ? undefined : "/auth",
  });

  if (
    !session &&
    (protectedPaths.has(c.req.path) || /^\/posts\/\d+\/edit$/.test(c.req.path))
  ) {
    return c.redirect("/", 307);
  }

  await next();
  if (c.res.status === 500) {
    return new Response("503 Service Unavailable", {
      status: 503,
      headers: {
        "content-type": c.res.headers.get("content-type") ?? "text/plain",
      },
    });
  }
});
