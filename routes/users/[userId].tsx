import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import { pool, selectUser } from "~/server/db.ts";
import UserPosts from "~/islands/UserPosts.tsx";

export default defineRoute(async (req, ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  const pageUser = await pool((client) => selectUser(client, Number(ctx.params.userId)));
  if (!pageUser) {
    return ctx.renderNotFound();
  }
  return (
    <>
      <Head>
        <title>{pageUser.name} - Leaves</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content={`${pageUser.name} - Leaves`}></meta>
        <meta property="og:description" content={pageUser.name}></meta>
        <meta property="og:image" content={pageUser.picture} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={pageUser.picture} />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1><img src={pageUser.picture} class="img-thumbnail" alt="" referrerpolicy="no-referrer" /> {pageUser.name}</h1>
        <UserPosts pageUser={pageUser} loginUser={session?.user} />
      </main>
    </>
  );
});
