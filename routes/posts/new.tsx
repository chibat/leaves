import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getSession } from "~/lib/auth.ts";
import { AppUser } from "~/lib/db.ts";
import PostNew from "~/islands/PostNew.tsx";

export const handler: Handlers<{ authUrl?: string, user?: AppUser }> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      // return new Response("Unauthorized", { status: 401 });
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const res = await ctx.render({ user: session.u });
    return res;
  },
};

export default function Page(props: PageProps<{ user?: AppUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.user} />
      <main className="container">
        <PostNew />
      </main>
    </>
  );
}
