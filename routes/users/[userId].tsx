import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import { selectUser } from "~/server/db.ts";
import UserPosts from "~/islands/UserPosts.tsx";

export default defineRoute(async (req, ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  const pageUser = await selectUser(Number(ctx.params.userId));
  if (!pageUser) {
    return ctx.renderNotFound();
  }
  const picture = pageUser.picture ?? undefined;
  const title = `${pageUser.name} - Leaves`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta property="og:url" content="https://leaves.chiba.dev/"></meta>
        <meta property="og:title" content={title}></meta>
        <meta property="og:description" content={title}>
        </meta>
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={picture} />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1>
          <img
            src={picture}
            class="img-thumbnail"
            alt=""
            referrerpolicy="no-referrer"
          />{" "}
          {pageUser.name}
        </h1>
        <UserPosts pageUserId={pageUser.id} loginUserId={session?.user.id} />
      </main>
    </>
  );
});
