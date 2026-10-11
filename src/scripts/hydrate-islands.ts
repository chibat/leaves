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
  name: string,
  Component: ComponentType<P>,
  element: HTMLElement,
) {
  const props = JSON.parse(element.dataset.props ?? "{}") as P;
  render(
    h(
      "div",
      {
        "data-preact-island": name,
        "data-props": JSON.stringify(props),
      },
      h(Component, props as P & { key?: string | number }),
    ),
    element,
  );
}

const islands: Record<string, (element: HTMLElement) => void> = {
  AllPosts: (element) => hydrateIsland("AllPosts", AllPosts, element),
  DeleteAccount: (element) => hydrateIsland("DeleteAccount", DeleteAccount, element),
  FollowingPosts: (element) => hydrateIsland("FollowingPosts", FollowingPosts, element),
  Header: (element) => hydrateIsland("Header", Header, element),
  LikePosts: (element) => hydrateIsland("LikePosts", LikePosts, element),
  PostEdit: (element) => hydrateIsland("PostEdit", PostEdit, element),
  PostNew: (element) => hydrateIsland("PostNew", PostNew, element),
  PostView: (element) => hydrateIsland("PostView", PostView, element),
  SearchedPosts: (element) => hydrateIsland("SearchedPosts", SearchedPosts, element),
  UserPosts: (element) => hydrateIsland("UserPosts", UserPosts, element),
};

document.querySelectorAll<HTMLElement>("[data-preact-island]").forEach(
  (element) => {
    const name = element.dataset.preactIsland as keyof typeof islands;
    const Component = islands[name];
    if (!Component) {
      throw new Error(`Unknown Preact island: ${name}`);
    }
    islands[name](element);
  },
);
