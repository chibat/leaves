import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.2/server.ts";
import Counter from "../islands/Counter.tsx";
import { clientId } from "../lib/env.ts";
import { getCallbackUrl } from "../lib/getCallbackUrl.ts";
import { getGoogleUser, GoogleUser } from "../lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "../lib/setAccessTokenToCookie.ts";

export function getAuthUrl(requestUrl: string): string {
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

export const handler: Handlers<{ authUrl: string, user: GoogleUser | undefined }> = {
  async GET(req, ctx) {
    const result = await getGoogleUser(req);
    const authUrl = getAuthUrl(req.url);
    const res = await ctx.render({ authUrl, user: result?.googleUser });
    if (result?.access_token) {
      setAccessTokenToCookie(res, result.access_token);
    }
    console.log(result);
    return res;
  },
};

function signout() {
  alert('hoge');
}

export default function Home(props: PageProps<{ authUrl: string, user: GoogleUser | undefined }>) {
  console.log(props.data);
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        {!props.data.user &&
          <a href={props.data.authUrl} >
            <input type="image" src="/btn_google_signin_dark_pressed_web.png" />
          </a>
        }
        {props.data.user && <>
          <ul>
            <li>{props.data.user.name}</li>
          </ul>
          <a href="/signout">Sign out</a>
        </>
        }
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class="my-6">
          Welcome to `fresh`. Try updating this message in the ./routes/index.tsx
          file, and refresh.
        </p>
        <Counter start={3} />
      </div>
    </>
  );
}
