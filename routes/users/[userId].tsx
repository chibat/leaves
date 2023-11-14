import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import { pool, selectUser } from "~/server/db.ts";
import UserPosts from "~/islands/UserPosts.tsx";

export default defineRoute(async (req, ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  const pageUser = (await selectUser(Number(ctx.params.userId))).data;
  if (!pageUser) {
    return ctx.renderNotFound();
  }
  const picture = pageUser.picture ?? undefined;
  return (
    <>
      <Head>
        <title>{pageUser.name} - Leaves</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content={`${pageUser.name} - Leaves`}></meta>
        <meta property="og:description" content={pageUser.name ?? undefined}></meta>
        <meta property="og:image" content={picture} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={picture} />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1><img src={picture} class="img-thumbnail" alt="" referrerpolicy="no-referrer" /> {pageUser.name}</h1>
        <UserPosts pageUser={pageUser} loginUser={session?.user} />
      </main>
    </>
  );
});
