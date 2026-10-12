import {
  cloneElement,
  h,
  isValidElement,
  type ComponentChildren,
  type ComponentProps,
} from "preact";
import renderToString from "preact-render-to-string";
import AboutPage from "../routes/about.tsx";
import FollowingPage from "../routes/following.tsx";
import HomePage from "../routes/index.tsx";
import LikesPage from "../routes/likes.tsx";
import NotificationPage from "../routes/notification.tsx";
import NewPostPage from "../routes/posts/new.tsx";
import EditPostPage from "../routes/posts/[postId]/edit.tsx";
import PostPage from "../routes/posts/[postId]/index.tsx";
import SearchPage from "../routes/search.tsx";
import SettingsPage from "../routes/settings.tsx";
import ShortcutsPage from "../routes/shortcuts.tsx";
import SitemapPage from "../routes/sitemap/index.tsx";
import UserSitemapPage from "../routes/sitemap/[userId].tsx";
import UserPage from "../routes/users/[userId]/index.tsx";
import NotFoundPage from "../routes/_404.tsx";
import AllPosts from "../islands/AllPosts.tsx";
import DeleteAccount from "../islands/DeleteAccount.tsx";
import FollowingPosts from "../islands/FollowingPosts.tsx";
import Header from "../islands/Header.tsx";
import LikePosts from "../islands/LikePosts.tsx";
import PostEdit from "../islands/PostEdit.tsx";
import PostNew from "../islands/PostNew.tsx";
import PostView from "../islands/PostView.tsx";
import SearchedPosts from "../islands/SearchedPosts.tsx";
import UserPosts from "../islands/UserPosts.tsx";
import { Head } from "../server/head.tsx";
import type { RouteContext } from "../server/route.ts";

const islandComponents = {
  AllPosts,
  DeleteAccount,
  FollowingPosts,
  Header,
  LikePosts,
  PostEdit,
  PostNew,
  PostView,
  SearchedPosts,
  UserPosts,
};

type IslandName = keyof typeof islandComponents;
type IslandSegment = {
  [Name in IslandName]: {
    kind: "island";
    name: Name;
    props: ComponentProps<typeof islandComponents[Name]>;
  };
}[IslandName];

export type LegacyPageSegment =
  | { kind: "html"; html: string }
  | IslandSegment;

type PageRoute = (request: Request, context: RouteContext) => unknown;

type RouteMatch = {
  route: PageRoute;
  params: Record<string, string>;
  notFound?: boolean;
};

const islandNames = new Map<unknown, IslandName>(
  Object.entries(islandComponents).map(([name, component]) => [
    component,
    name as IslandName,
  ]),
);

function islandPlaceholder(index: number) {
  return `<astro-island-slot data-index="${index}"></astro-island-slot>`;
}

function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    throw new Error(`Invalid URL path segment: ${value}`, { cause: error });
  }
}

function matchRoute(pathname: string): RouteMatch {
  pathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const staticRoutes: Record<string, PageRoute> = {
    "/": HomePage,
    "/about": AboutPage,
    "/following": FollowingPage,
    "/likes": LikesPage,
    "/notification": NotificationPage,
    "/posts/new": NewPostPage,
    "/search": SearchPage,
    "/settings": SettingsPage,
    "/shortcuts": ShortcutsPage,
    "/sitemap": SitemapPage,
  };
  if (Object.prototype.hasOwnProperty.call(staticRoutes, pathname)) {
    return { route: staticRoutes[pathname], params: {} };
  }

  let match = /^\/posts\/([^/]+)\/edit$/.exec(pathname);
  if (match) {
    return { route: EditPostPage, params: { postId: decodeRouteParam(match[1]) } };
  }
  match = /^\/posts\/([^/]+)$/.exec(pathname);
  if (match) {
    return { route: PostPage, params: { postId: decodeRouteParam(match[1]) } };
  }
  match = /^\/sitemap\/([^/]+)$/.exec(pathname);
  if (match) {
    return {
      route: UserSitemapPage,
      params: { userId: decodeRouteParam(match[1]) },
    };
  }
  match = /^\/users\/([^/]+)$/.exec(pathname);
  if (match) {
    return { route: UserPage, params: { userId: decodeRouteParam(match[1]) } };
  }

  return { route: NotFoundPage, params: {}, notFound: true };
}

function transformChild(
  child: ComponentChildren,
  head: ComponentChildren[],
  islands: IslandSegment[],
): ComponentChildren {
  if (Array.isArray(child)) {
    return child.map((item) => transformChild(item, head, islands));
  }
  if (!isValidElement(child)) {
    return child;
  }
  if (child.type === Head) {
    head.push(child.props.children);
    return null;
  }
  const islandName = islandNames.get(child.type);
  if (islandName) {
    const props = { ...child.props };
    delete props.children;
    islands.push({
      kind: "island",
      name: islandName,
      props,
    } as IslandSegment);
    return h("astro-island-slot", { "data-index": islands.length - 1 });
  }
  return cloneElement(
    child,
    {},
    transformChild(child.props.children, head, islands),
  );
}

export type LegacyPageResult =
  | { kind: "response"; response: Response }
  | {
    kind: "page";
    headHtml: string;
    segments: LegacyPageSegment[];
    title: string;
    notFound: boolean;
  };

export function renderHandlerPage(component: () => ComponentChildren) {
  return new Response(renderToString(h(component, null)), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderPage(
  result: unknown,
  request: Request,
  notFound: boolean,
): LegacyPageResult {
  if (!isValidElement(result)) {
    throw new TypeError("The page route must return a Preact element or Response.");
  }
  const head: ComponentChildren[] = [];
  const islands: IslandSegment[] = [];
  const page = transformChild(result, head, islands);
  const headHtml = renderToString(h("div", null, head));
  const bodyHtml = renderToString(h("div", null, page)).slice(
    "<div>".length,
    -"</div>".length,
  );
  const segments: LegacyPageSegment[] = [];
  let cursor = 0;
  islands.forEach((island, index) => {
    const marker = islandPlaceholder(index);
    const markerIndex = bodyHtml.indexOf(marker, cursor);
    if (markerIndex < 0) {
      throw new Error(`Missing Astro island placeholder: ${index}`);
    }
    if (markerIndex > cursor) {
      segments.push({ kind: "html", html: bodyHtml.slice(cursor, markerIndex) });
    }
    segments.push(island);
    cursor = markerIndex + marker.length;
  });
  if (cursor < bodyHtml.length) {
    segments.push({ kind: "html", html: bodyHtml.slice(cursor) });
  }
  return {
    kind: "page",
    headHtml: headHtml.slice("<div>".length, -"</div>".length),
    segments,
    title: new URL(request.url).pathname === "/"
      ? "Leaves - Microblog with Markdown"
      : "Leaves",
    notFound,
  };
}

export async function renderLegacyPage(
  request: Request,
): Promise<LegacyPageResult> {
  const { route, params, notFound } = matchRoute(new URL(request.url).pathname);
  const context: RouteContext = {
    params,
    url: new URL(request.url),
    async render() {
      return new Response("Page rendering is not available for this route.", {
        status: 500,
      });
    },
    renderNotFound() {
      return new Response("Not Found", {
        status: 404,
        headers: { "x-leaves-render-not-found": "1" },
      });
    },
  };
  let result = await route(request, context);
  let isNotFound = notFound ?? false;
  if (result instanceof Response) {
    if (result.headers.get("x-leaves-render-not-found") === "1") {
      result = await NotFoundPage(request, context);
      isNotFound = true;
    } else {
      return { kind: "response", response: result };
    }
  }
  return renderPage(result, request, isNotFound);
}
