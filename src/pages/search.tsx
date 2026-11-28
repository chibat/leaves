import type { Props } from "./search.server.ts";
import SearchedPosts from "~/islands/SearchedPosts.tsx";

export default function Search({
  searchWord,
  posts,
  loginUserId,
  title,
}: Props) {
  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={title} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@tomofummy" />
      <meta
        name="twitter:image"
        content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
      />
      <main className="container">
        <h1>Search</h1>
        <form className="mb-3" method="GET" action="/search">
          <input
            className="form-control"
            type="text"
            name="value"
            value={searchWord}
            placeholder="Input search words"
            autoFocus={!searchWord}
          />
        </form>
        {searchWord && posts && (
          <SearchedPosts
            searchWord={searchWord}
            loginUserId={loginUserId}
            initialPosts={posts}
          />
        )}
      </main>
    </>
  );
}
