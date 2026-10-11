import { Head } from "~/server/head.tsx";
import { defineRoute } from "~/server/route.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import PostNew from "~/islands/PostNew.tsx";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  if (!session) {
    // return new Response("Unauthorized", { status: 401 });
    const authUrl = getAuthUrl(req.url);
    return Response.redirect(authUrl);
  }
  return (
    <>
      <Head>
        <title>New - Leaves</title>
      </Head>
      <Header user={session.user} />
      <main class="container">
        <h1>New Post</h1>
        <PostNew />
      </main>
    </>
  );
});
