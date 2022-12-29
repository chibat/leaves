import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAuthUrl, getCallbackUrl, getSession } from "~/lib/auth.ts";
import Header from "~/islands/Header.tsx";
import { AppUser } from "~/lib/db.ts";


export const handler: Handlers<{ authUrl?: string, user?: AppUser }> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ authUrl, user: session?.u });
    return res;
  },
};

export default function Home(props: PageProps<{ authUrl?: string, user?: AppUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.user} authUrl={props.data.authUrl} />
      <main className="container">
        {props.data.user &&
          <div className="card mb-3">
            <div className="card-body">
              {props.data.user.picture &&
                <img src={props.data.user.picture} alt="mdo" width="32" height="32" className="rounded-circle me-2" />
              }
              <a href="/post">
                <input className="form-control" type="text" placeholder="Post" aria-label="Post" readOnly style={{ cursor: "pointer", width: "90%", display: "inline" }} ></input>
              </a>
            </div>
          </div>
        }
      </main>

      <div class="p-4 mx-auto max-w-screen-md">
        {props.data.user && <>
          <ul>
            <li>{props.data.user.name}</li>
          </ul>
        </>
        }
      </div>
    </>
  );
}
