import { h, render, type ComponentType } from "preact";
import AllPosts from "../../islands/AllPosts.tsx";
import DeleteAccount from "../../islands/DeleteAccount.tsx";
import FollowingPosts from "../../islands/FollowingPosts.tsx";
import Header from "../../islands/Header.tsx";
import LikePosts from "../../islands/LikePosts.tsx";
import PostEdit from "../../islands/PostEdit.tsx";
import PostNew from "../../islands/PostNew.tsx";
import PostView from "../../islands/PostView.tsx";
import SearchedPosts from "../../islands/SearchedPosts.tsx";
import UserPosts from "../../islands/UserPosts.tsx";

function hydrateIsland<P extends object>(
  Component: ComponentType<P>,
  element: HTMLElement,
) {
  const props = JSON.parse(element.dataset.props ?? "{}") as P;
  render(h(Component, props), element);
}

const islands: Record<string, (element: HTMLElement) => void> = {
  AllPosts: (element) => hydrateIsland(AllPosts, element),
  DeleteAccount: (element) => hydrateIsland(DeleteAccount, element),
  FollowingPosts: (element) => hydrateIsland(FollowingPosts, element),
  Header: (element) => hydrateIsland(Header, element),
  LikePosts: (element) => hydrateIsland(LikePosts, element),
  PostEdit: (element) => hydrateIsland(PostEdit, element),
  PostNew: (element) => hydrateIsland(PostNew, element),
  PostView: (element) => hydrateIsland(PostView, element),
  SearchedPosts: (element) => hydrateIsland(SearchedPosts, element),
  UserPosts: (element) => hydrateIsland(UserPosts, element),
};

function hydrateIslands() {
  document.querySelectorAll<HTMLElement>(
    "[data-preact-island]:not([data-preact-hydrated])",
  ).forEach((element) => {
    const name = element.dataset.preactIsland;
    const hydrate = name ? islands[name] : undefined;
    if (!hydrate) {
      throw new Error(`Unknown Preact island: ${name ?? "(missing name)"}`);
    }
    element.dataset.preactHydrated = "true";
    hydrate(element);
  });
}

function unmountIslands() {
  document.querySelectorAll<HTMLElement>("[data-preact-hydrated]").forEach(
    (element) => {
      render(null, element);
      delete element.dataset.preactHydrated;
    },
  );
}

function focusAutofocus() {
  document.querySelector<HTMLElement>("[autofocus]")?.focus();
}

document.addEventListener("astro:page-load", hydrateIslands);
document.addEventListener("astro:page-load", focusAutofocus);
document.addEventListener("astro:before-swap", unmountIslands);
hydrateIslands();
focusAutofocus();
