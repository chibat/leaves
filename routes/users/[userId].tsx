import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/lib/auth.ts";
import Header from "~/islands/Header.tsx";
import { AppUser, pool, selectUser } from "~/lib/db.ts";
import UserPosts from "../../islands/UserPosts.tsx";

type PageType = {
  pageUser: AppUser,
  loginUser?: AppUser,
  authUrl?: string
}

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const pageUser = await pool((client) => selectUser(client, Number(ctx.params.userId)));
    if (!pageUser) {
      return ctx.renderNotFound();
    }

    const res = await ctx.render({ pageUser, loginUser: session?.u, authUrl });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
        <meta property="og:url" content="https://md-sns.herokuapp.com/"></meta>
        <meta property="og:title" content={`${props.data.pageUser.name} - md-sns`}></meta>
        <meta property="og:description" content={props.data.pageUser.name}></meta>
        <meta property="og:image" content={props.data.pageUser.picture} />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:image" content={props.data.pageUser.picture} />
      </Head>
      <Header user={props.data.loginUser} authUrl={props.data.authUrl} />
      <main className="container">
        <UserPosts pageUser={props.data.pageUser} loginUser={props.data.loginUser} />
      </main>
    </>
  );
}



