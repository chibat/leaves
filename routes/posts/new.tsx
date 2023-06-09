import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import { AppUser } from "~/server/db.ts";
import PostNew from "~/islands/PostNew.tsx";

export const handler: Handlers<{ authUrl?: string, user?: AppUser }> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      // return new Response("Unauthorized", { status: 401 });
      const authUrl = getAuthUrl(req.url);
      return Response.redirect(authUrl);
    }
    const res = await ctx.render({ user: session.user });
    return res;
  },
};

export default function Page(props: PageProps<{ user?: AppUser }>) {
  return (
    <>
      <Head>
        <title>New - Leaves</title>
      </Head>
      <Header user={props.data.user} />
      <main class="container">
        <h1>New Post</h1>
        <PostNew />
      </main>
    </>
  );
}
