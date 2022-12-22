import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { clientId } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";
import { getGoogleUser, GoogleUser } from "~/lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";
import IconBell from "tabler_icons_tsx/tsx/bell.tsx"
import IconBellRinging from "tabler_icons_tsx/tsx/bell-ringing.tsx"


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

      <header aria-label="Site Header" class="bg-white border-b border-gray-100">
        <div
          class="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8"
        >
          <a class="block text-green-600" href="/">
            <span class="sr-only">Home</span>
            <img src="/favicon.ico" class="" />
          </a>
          <a class="text-2xl font-bold" href="/">md-sns</a>
          <div class="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Site Nav" class="hidden md:block">
              <ul class="flex items-center gap-6 text-sm">
                <li>
                  <a class="text-gray-500 transition hover:text-gray-400" href="/">About</a>
                </li>
                <li>
                  <a class="text-gray-500 transition hover:text-gray-400" href="/">
                    All
                  </a>
                </li>
                <li>
                  <a class="text-gray-500 transition hover:text-gray-400" href="/">
                    Following
                  </a>
                </li>
              </ul>
            </nav>
            {props.data.user &&
              <div class="flex items-center gap-4">
                <div class="sm:flex sm:gap-4">
                  <a class="py-2.5" href="/">
                    <IconBell class="w-6 h-6" />
                  </a>
                  <a class="py-2.5" href="/">
                    <IconBellRinging class="w-6 h-6" />
                  </a>
                  <img class="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
              </div>
            }
          </div>
        </div>
      </header>
      <div class="flex justify-center">
        {!props.data.user &&
          <a href={props.data.authUrl} >
            <input type="image" src="/btn_google_signin_dark_pressed_web.png" />
          </a>
        }
      </div>
      <div class="p-4 mx-auto max-w-screen-md">
        {props.data.user && <>
          <ul>
            <li>{props.data.user.name}</li>
          </ul>
          <a href="/signout">Sign out</a>
        </>
        }
      </div>
    </>
  );
}
