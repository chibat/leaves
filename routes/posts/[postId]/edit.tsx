import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { AppUser, pool, Post, selectPost } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/lib/auth.ts";
import PostEdit from "~/islands/PostEdit.tsx";

type PageType = {
  authUrl?: string;
  user: AppUser;
  post: Post;
};

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {

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

    const res = await ctx.render({ user: session?.user, authUrl, post });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  const user = props.data.user;
  return (
    <>
      <Head>
        <title>Edit - md-sns</title>
      </Head>
      <Header user={user} authUrl={props.data.authUrl} />
      <main class="container">
        <h1>Edit Post</h1>
        <PostEdit post={props.data.post} />
      </main>
    </>
  );
}
