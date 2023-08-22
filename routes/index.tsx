import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import AllPosts from "~/islands/AllPosts.tsx";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  return (
    <>
      <Head>
        <title>Leaves - Microblog with Markdown</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta property="og:image" content="https://leaves.deno.dev/assets/img/icon-192x192.png" />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta name="twitter:image" content="https://leaves.deno.dev/assets/img/icon-192x192.png" />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        {!session?.user && authUrl &&
          <div class="card mb-3">
            <div class="card-body">
              <div class="px-4 py-5 my-5 text-center">
                <img class="d-block mx-auto mb-4" src="/assets/img/icon-192x192.png" alt="Leaves" width="100px" />
                <h1 class="display-5 fw-bold text-body-emphasis">Leaves</h1>
                <div class="col-lg-6 mx-auto">
                  <p class="lead mb-4">This website is a Microblog that allows you to post in <b>Markdown</b>.<br />Sign in with your Google account and use it.</p>
                  <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <div style={{ textAlign: "center" }}>
                      <a href={authUrl}>
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
            {session?.user?.picture &&
              <img src={session.user.picture} alt="mdo" width="32" height="32" referrerpolicy="no-referrer" class="rounded-circle me-2" />
            }
            <a href="/posts/new">
              <input class="form-control" type="text" placeholder="Post" aria-label="Post" readOnly style={{ cursor: "pointer", width: "90%", display: "inline" }} ></input>
            </a>
          </div>
        </div>
        <AllPosts loginUser={session?.user} />
      </main>
    </>
  );
});
