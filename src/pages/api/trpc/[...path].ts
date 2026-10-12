import type { APIRoute } from "astro";
import { appRouter } from "~/server/trpc/router.ts";
import { createContext } from "~/server/trpc/context.ts";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handle: APIRoute = async ({ request }) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
  });
};

export const GET = handle;
export const POST = handle;
