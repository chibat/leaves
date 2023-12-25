import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import SearchedPosts from "~/islands/SearchedPosts.tsx";

export default defineRoute(async (req, ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  const searchParams = ctx.url.searchParams.get("value") || "";
  return (
    <>
      <Head>
        <title>Search:{searchParams} - Leaves</title>
        <meta property="og:title" content={`Search:${searchParams} - Leaves`}>
        </meta>
        <meta
          property="og:description"
          content={`Search:${searchParams} - Leaves`}
        >
        </meta>
        <meta
          property="og:image"
          content="https://leaves.deno.dev/assets/img/icon-192x192.png"
        />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta
          name="twitter:image"
          content="https://leaves.deno.dev/assets/img/icon-192x192.png"
        />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1>Search</h1>
        <form class="mb-3" method="GET" action="/search">
          <input
            class="form-control"
            type="text"
            name="value"
            value={searchParams}
            placeholder="Input search words"
            autoFocus={!searchParams}
          />
        </form>
        {searchParams &&
          (
            <SearchedPosts
              searchWord={searchParams}
              loginUserId={session?.user.id}
            />
          )}
      </main>
    </>
  );
});
