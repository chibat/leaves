import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { AppUser, pool, Post, selectPost } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/lib/auth.ts";

type PageType = {
  authUrl?: string;
  user?: AppUser;
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

    const res = await ctx.render({ user: session?.u, authUrl, post });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  const user = props.data.user;
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={user} authUrl={props.data.authUrl} />
      <div class="p-4 mx-auto max-w-screen-md">
        edit
      </div>
    </>
  );
}
