import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import { AppUser, pool, Post, selectPost } from "~/server/db.ts";
import PostView from "~/islands/PostView.tsx";
import { getTitle } from "~/server/getTitle.ts";

type PageType = {
  authUrl?: string;
  user?: AppUser;
  post: Post;
};

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    const postId = Number(ctx.params.postId);
    const post = await pool((client) => selectPost(client, postId));
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
    const res = await ctx.render({ user: session?.user, authUrl, post });
    return res;
  },
};

export default function Page(
  props: PageProps<PageType>,
) {
  const user = props.data.user;
  const post = props.data.post;
  const title = getTitle(post.source) + " | Leaves";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content={title}></meta>
        <meta property="og:description" content={post.source?.substring(0, 1000)?.replaceAll("\n", " ")}></meta>
        <meta property="og:image" content={post.picture} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={post.picture} />
      </Head>
      <Header user={user} authUrl={props.data.authUrl} />
      <main class="container">
        <PostView post={props.data.post} postTitle={title} user={user} />
      </main>
    </>
  );
}
