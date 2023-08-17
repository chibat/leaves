import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import FollowingPosts from "~/islands/FollowingPosts.tsx";
import Header from "~/islands/Header.tsx";
import { getSession } from "~/server/auth.ts";

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
        <title>Following - Leaves</title>
      </Head>
      <Header user={session.user} />
      <main class="container">
        <FollowingPosts loginUser={session.user} />
      </main>
    </>
  );
});


