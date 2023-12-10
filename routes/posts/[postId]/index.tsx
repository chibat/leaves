import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import { selectPost } from "~/server/db.ts";
import PostView from "~/islands/PostView.tsx";
import { getTitle } from "~/server/getTitle.ts";

export default defineRoute(async (req, ctx) => {
  const postId = Number(ctx.params.postId);
  const post = await selectPost(postId);
  if (!post) {
    return ctx.renderNotFound();
  }

  const session = await getSession(req);
  if (post.draft && post.user_id !== session?.user.id) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  const authUrl = session ? undefined : getAuthUrl(req.url);
  const user = session?.user;
  const title = getTitle(post.source) + " | Leaves";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content={title}></meta>
        <meta
          property="og:description"
          content={post.source.substring(0, 1000)?.replaceAll("\n", " ")}
        >
        </meta>
        <meta property="og:image" content={post.picture!} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={post.picture!} />
      </Head>
      <Header user={user} authUrl={authUrl} />
      <main class="container">
        <PostView post={post} postTitle={title} userId={user?.id} />
      </main>
    </>
  );
});
