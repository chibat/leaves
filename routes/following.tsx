import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import FollowingPosts from "~/islands/FollowingPosts.tsx";
import { AppUser } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "../lib/auth.ts";

type PageType = {
  loginUser?: AppUser,
  authUrl?: string
}

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ loginUser: session?.u, authUrl });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
        <meta property="og:url" content="https://md-sns.herokuapp.com/"></meta>
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
      </Head>
      <Header user={props.data.loginUser} authUrl={props.data.authUrl} />
      <main class="container">
        <FollowingPosts />
      </main>
    </>
  );
}


