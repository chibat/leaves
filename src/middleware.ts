import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { withEnvironment } from "../server/env.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await withEnvironment(
    env as Record<string, string>,
    next,
  );
  if (response.status === 500) {
    return new Response("503 Service Unavailable", {
      status: 503,
      headers: { "content-type": response.headers.get("content-type") ?? "text/plain" },
    });
  }
  const url = new URL(context.request.url);
  if (url.hostname === "leaves.deno.dev" || url.hostname === "leaves.ct.deno.net") {
    url.hostname = "leaves.chiba.dev";
    return Response.redirect(url, 301);
  }
  return response;
});
