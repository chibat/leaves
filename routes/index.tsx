import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import { AppUser } from "~/server/db.ts";
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
        <title>Leaves - SNS with Markdown</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta property="og:image" content="https://leaves.deno.dev/assets/img/icon-192x192.png" />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta name="twitter:image" content="https://leaves.deno.dev/assets/img/icon-192x192.png" />
      </Head>
      <Header user={props.data.user} authUrl={props.data.authUrl} />
      <main class="container">
        {!props.data.user && props.data.authUrl &&
          <div class="card mb-3">
            <div class="card-body">
              <div class="px-4 py-5 my-5 text-center">
                <img class="d-block mx-auto mb-4" src="/assets/img/icon-192x192.png" alt="Leaves" width="100px" />
                <h1 class="display-5 fw-bold text-body-emphasis">Leaves</h1>
                <div class="col-lg-6 mx-auto">
                  <p class="lead mb-4">This website is a SNS that allows you to post in Markdown.<br />Sign in with your Google account and use it.</p>
                  <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <div style={{ textAlign: "center" }}>
                      <a href={props.data.authUrl}>
                        <input type="image" src="/btn_google_signin_dark_pressed_web.png" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div class="card mb-3">
          <div class="card-body">
            {props.data.user?.picture &&
              <img src={props.data.user.picture} alt="mdo" width="32" height="32" referrerpolicy="no-referrer" class="rounded-circle me-2" />
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
