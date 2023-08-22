import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { pool, selectPost } from "~/server/db.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import PostEdit from "~/islands/PostEdit.tsx";

export default defineRoute(async (req, ctx) => {
  const session = await getSession(req);
  if (!session) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  const authUrl = session ? undefined : getAuthUrl(req.url);

  const postId = Number(ctx.params.postId);
  const post = await pool((client) => selectPost(client, postId));
  if (!post) {
    return ctx.renderNotFound();
  }
  if (session.user.id !== post.user_id) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }

  const user = session.user;
  return (
    <>
      <Head>
        <title>Edit - Leaves</title>
      </Head>
      <Header user={user} authUrl={authUrl} />
      <main class="container">
        <h1>Edit Post</h1>
        <PostEdit post={post} />
      </main>
    </>
  );
});
