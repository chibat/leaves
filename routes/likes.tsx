import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getSession } from "~/server/auth.ts";
import LikePosts from "~/islands/LikePosts.tsx";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  if (!session) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  return (
    <>
      <Head>
        <title>Likes - Leaves</title>
      </Head>
      <Header user={session.user} />
      <main class="container">
        <LikePosts loginUserId={session.user.id} />
      </main>
    </>
  );
});

