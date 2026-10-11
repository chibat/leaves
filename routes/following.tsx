import { Head } from "~/server/head.tsx";
import { defineRoute } from "~/server/route.ts";
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
        <FollowingPosts loginUserId={session.user.id} />
      </main>
    </>
  );
});

