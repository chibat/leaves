// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_500 from "./routes/_500.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $about from "./routes/about.tsx";
import * as $api_trpc_path_ from "./routes/api/trpc/[path].ts";
import * as $auth from "./routes/auth.ts";
import * as $callback from "./routes/callback.tsx";
import * as $debug_auth from "./routes/debug_auth.tsx";
import * as $following from "./routes/following.tsx";
import * as $help from "./routes/help.tsx";
import * as $index from "./routes/index.tsx";
import * as $likes from "./routes/likes.tsx";
import * as $notification from "./routes/notification.tsx";
import * as $posts_postId_edit from "./routes/posts/[postId]/edit.tsx";
import * as $posts_postId_index from "./routes/posts/[postId]/index.tsx";
import * as $posts_new from "./routes/posts/new.tsx";
import * as $search from "./routes/search.tsx";
import * as $settings from "./routes/settings.tsx";
import * as $signout from "./routes/signout.ts";
import * as $sitemap_userId_ from "./routes/sitemap/[userId].tsx";
import * as $sitemap_index from "./routes/sitemap/index.tsx";
import * as $users_userId_ from "./routes/users/[userId].tsx";
import * as $AllPosts from "./islands/AllPosts.tsx";
import * as $DeleteAccount from "./islands/DeleteAccount.tsx";
import * as $FollowingPosts from "./islands/FollowingPosts.tsx";
import * as $Header from "./islands/Header.tsx";
import * as $LikePosts from "./islands/LikePosts.tsx";
import * as $PostEdit from "./islands/PostEdit.tsx";
import * as $PostNew from "./islands/PostNew.tsx";
import * as $PostView from "./islands/PostView.tsx";
import * as $SearchedPosts from "./islands/SearchedPosts.tsx";
import * as $UserPosts from "./islands/UserPosts.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_500.tsx": $_500,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.ts": $_middleware,
    "./routes/about.tsx": $about,
    "./routes/api/trpc/[path].ts": $api_trpc_path_,
    "./routes/auth.ts": $auth,
    "./routes/callback.tsx": $callback,
    "./routes/debug_auth.tsx": $debug_auth,
    "./routes/following.tsx": $following,
    "./routes/help.tsx": $help,
    "./routes/index.tsx": $index,
    "./routes/likes.tsx": $likes,
    "./routes/notification.tsx": $notification,
    "./routes/posts/[postId]/edit.tsx": $posts_postId_edit,
    "./routes/posts/[postId]/index.tsx": $posts_postId_index,
    "./routes/posts/new.tsx": $posts_new,
    "./routes/search.tsx": $search,
    "./routes/settings.tsx": $settings,
    "./routes/signout.ts": $signout,
    "./routes/sitemap/[userId].tsx": $sitemap_userId_,
    "./routes/sitemap/index.tsx": $sitemap_index,
    "./routes/users/[userId].tsx": $users_userId_,
  },
  islands: {
    "./islands/AllPosts.tsx": $AllPosts,
    "./islands/DeleteAccount.tsx": $DeleteAccount,
    "./islands/FollowingPosts.tsx": $FollowingPosts,
    "./islands/Header.tsx": $Header,
    "./islands/LikePosts.tsx": $LikePosts,
    "./islands/PostEdit.tsx": $PostEdit,
    "./islands/PostNew.tsx": $PostNew,
    "./islands/PostView.tsx": $PostView,
    "./islands/SearchedPosts.tsx": $SearchedPosts,
    "./islands/UserPosts.tsx": $UserPosts,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
