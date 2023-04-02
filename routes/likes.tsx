import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { AppUser } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";
import { getSession } from "~/lib/auth.ts";
import LikePosts from "~/islands/LikePosts.tsx";

type PageType = {
  loginUser?: AppUser,
}

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
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
        <title>Likes - Leaves</title>
      </Head>
      <Header user={props.data.loginUser} />
      <main class="container">
        <LikePosts loginUser={props.data.loginUser} />
      </main>
    </>
  );
}

