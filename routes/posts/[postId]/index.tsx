import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/lib/auth.ts";
import { AppUser, pool, Post, selectPost } from "~/lib/db.ts";
import PostView from "~/islands/PostView.tsx";

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

    console.log(postId);
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ user: session?.u, authUrl, post });
    return res;
  },
};

export default function Page(
  props: PageProps<PageType>,
) {
  const user = props.data.user;
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={user} authUrl={props.data.authUrl} />
      <main className="container">
        <PostView post={props.data.post} user={user} />
      </main>
    </>
  );
}
