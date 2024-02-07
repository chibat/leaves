import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import DeleteAccount from "~/islands/DeleteAccount.tsx";
import { Head } from "$fresh/runtime.ts";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  if (!session) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  const authUrl = getAuthUrl(req.url);
  return (
    <>
      <Head>
        <title>Settings - Leaves</title>
        <meta property="og:url" content="https://leaves.chiba.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta
          name="twitter:image"
          content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
        />
      </Head>
      <Header user={session.user} authUrl={authUrl} />
      <main class="container">
        <h1>
          <img
            src="/assets/img/gear-fill.svg"
            alt="Likes"
            width="32"
            height="32"
            class="me-2"
          />Settings
        </h1>
        {
          /* <h2>Name</h2>
        TODO: move to islands
        <input class="form-control" type="text" value={session.user.name} />
        <button class="btn btn-primary mt-3" type="submit">Save</button> */
        }
        <DeleteAccount userName={session.user.name} />
      </main>
    </>
  );
});
