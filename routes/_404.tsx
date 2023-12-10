import { defineRoute } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  return (
    <>
      <Head>
        <title>Not Found - Leaves</title>
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1>404 Not Found</h1>
      </main>
    </>
  );
});
