import type { RouteContext } from "../server/route.ts";
import type { ComponentChildren } from "preact";
import { renderHandlerPage } from "./legacy.tsx";
import { handler as authHandler } from "../routes/auth.ts";
import { handler as callbackHandler } from "../routes/callback.tsx";
import DebugAuthPage, { handler as debugAuthHandler } from "../routes/debug_auth.tsx";
import { handler as signoutHandler } from "../routes/signout.ts";
import cliSearch from "../routes/api/cli/search.ts";
import cliPost from "../routes/api/cli/posts/[postId].ts";
import userRss from "../routes/users/[userId]/rss.ts";

function createContextFor(request: Request, params: Record<string, string> = {}): RouteContext {
  return {
    params,
    url: new URL(request.url),
    render: async () => new Response("Not implemented", { status: 500 }),
    renderNotFound: () => new Response("Not Found", { status: 404 }),
  };
}

function createPageContext(
  request: Request,
  params: Record<string, string>,
  component: () => ComponentChildren,
): RouteContext {
  return {
    ...createContextFor(request, params),
    render: async () => renderHandlerPage(component),
  };
}

export async function handleLegacyEndpoint(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (path === "/api/trpc" || path.startsWith("/api/trpc/")) {
    const { handler } = await import("../routes/api/trpc/[path].ts");
    return handler(request, createContextFor(request));
  }
  if (path === "/api/cli/search" && method === "GET") {
    return cliSearch(request, createContextFor(request));
  }
  const cliPostMatch = /^\/api\/cli\/posts\/([^/]+)$/.exec(path);
  if (cliPostMatch && method === "GET") {
    return cliPost(request, createContextFor(request, {
      postId: decodeURIComponent(cliPostMatch[1]),
    }));
  }
  const rssMatch = /^\/users\/([^/]+)\/rss$/.exec(path);
  if (rssMatch && method === "GET") {
    return userRss(request, createContextFor(request, {
      userId: decodeURIComponent(rssMatch[1]),
    }));
  }

  const handlers = path === "/auth"
    ? authHandler
    : path === "/callback"
    ? callbackHandler
    : path === "/signout"
    ? signoutHandler
    : path === "/debug_auth"
    ? debugAuthHandler
    : undefined;

  if (handlers) {
    const handler = handlers[method as keyof typeof handlers];
    if (!handler) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: Object.keys(handlers).join(", ") },
      });
    }
    const page = path === "/debug_auth"
      ? () => DebugAuthPage()
      : () => null;
    return handler(
      request,
      createPageContext(request, {}, page),
    );
  }

  return new Response("Not Found", { status: 404 });
}
