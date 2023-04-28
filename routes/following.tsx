import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import FollowingPosts from "~/islands/FollowingPosts.tsx";
import { AppUser } from "~/server/db.ts";
import Header from "~/islands/Header.tsx";
import { getSession } from "~/server/auth.ts";

type PageType = {
  loginUser?: AppUser,
}

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    // TODO セッションがなければトップへ
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const res = await ctx.render({ loginUser: session.user });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <>
      <Head>
        <title>Following - Leaves</title>
      </Head>
      <Header user={props.data.loginUser} />
      <main class="container">
        <FollowingPosts loginUser={props.data.loginUser} />
      </main>
    </>
  );
}


