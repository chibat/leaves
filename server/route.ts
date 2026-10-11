import type { ComponentChildren } from "preact";

export type RouteContext = {
  params: Record<string, string>;
  url: URL;
  render(): Promise<Response>;
  renderNotFound(): Response;
};

export type PageProps = {
  Component: (props: Record<string, unknown>) => ComponentChildren;
  error?: unknown;
};

type Handler = (request: Request, context: RouteContext) => Response | Promise<Response>;

export type Handlers = Partial<
  Record<"GET" | "POST" | "PUT" | "DELETE" | "PATCH", Handler>
>;

export function defineRoute<T extends (request: Request, context: RouteContext) => unknown>(
  route: T,
): T {
  return route;
}
