import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { clientId } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";
import { getGoogleUser, GoogleUser } from "~/lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";
import Header from "../islands/Header.tsx";

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
    if (!googleUser) {
      // return new Response("Unauthorized", { status: 401 });
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const res = await ctx.render({ user: googleUser });
    if (access_token) {
      setAccessTokenToCookie(res, access_token);
    }
    return res;
  },
};

export default function Home(props: PageProps<{ user?: GoogleUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.user} />
      <div class="p-4 mx-auto max-w-screen-md">
        <h1>Post</h1>
      </div>
    </>
  );
}
