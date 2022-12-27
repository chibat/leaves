import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { clientId } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";
import { getGoogleUser, GoogleUser } from "~/lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";
import Header from "~/islands/Header.tsx";

function getAuthUrl(requestUrl: string): string {
  const redirectUri = getCallbackUrl(requestUrl);
  if (!clientId) {
    throw new Error("clientId is undefined");
  }
  return "https://accounts.google.com/o/oauth2/auth?" +
    new URLSearchParams([
      ["client_id", clientId],
      ["redirect_uri", redirectUri],
      ["scope", "https://www.googleapis.com/auth/userinfo.profile"],
      ["access_type", "offline"],
      ["response_type", "code"],
    ]).toString();
}

export const handler: Handlers<{ authUrl?: string, user?: GoogleUser }> = {
  async GET(req, ctx) {
    const { googleUser, access_token } = await getGoogleUser(req);
    const authUrl = googleUser ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ authUrl, user: googleUser });
    if (access_token) {
      setAccessTokenToCookie(res, access_token);
    }
    return res;
  },
};

export default function Home(props: PageProps<{ authUrl?: string, user?: GoogleUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header authUrl={props.data.authUrl} user={props.data.user} />
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
