import { MiddlewareHandlerContext } from "$fresh/server.ts";

export async function handler(
  _req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const resp = await ctx.next();
  if (resp.status === 500) {
    const contentType = resp.headers.get("content-type") || "text/plain";
    return new Response("503 Service Unavailable", {
      status: 503,
      headers: { "content-type": contentType },
    });
  }
  return resp;
}
