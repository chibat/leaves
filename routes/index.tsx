import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/lib/auth.ts";
import Header from "~/islands/Header.tsx";
import { AppUser } from "~/lib/db.ts";
import AllPosts from "~/islands/AllPosts.tsx";

export const handler: Handlers<{ authUrl?: string, user?: AppUser }> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ authUrl, user: session?.user });
    return res;
  },
};

export default function Home(props: PageProps<{ authUrl?: string, user?: AppUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
        <meta property="og:url" content="https://md-sns.deno.dev/"></meta>
        <meta property="og:title" content="md-sns"></meta>
        <meta property="og:image" content="https://md-sns.deno.dev/assets/img/icon-192x192.png" />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta name="twitter:image" content="https://md-sns.deno.dev/assets/img/icon-192x192.png" />
      </Head>
      <Header user={props.data.user} authUrl={props.data.authUrl} />
      <main class="container">
        <div class="card mb-3">
          <div class="card-body">
            {props.data.user?.picture &&
              <img src={props.data.user.picture} alt="mdo" width="32" height="32" class="rounded-circle me-2" />
            }
            <a href="/posts/new">
              <input class="form-control" type="text" placeholder="Post" aria-label="Post" readOnly style={{ cursor: "pointer", width: "90%", display: "inline" }} ></input>
            </a>
          </div>
        </div>
        <AllPosts loginUser={props.data.user} />
      </main>
    </>
  );
}
