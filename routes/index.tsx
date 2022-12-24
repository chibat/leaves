import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { clientId } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";
import { getGoogleUser, GoogleUser } from "~/lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";
import IconBell from "tabler_icons_tsx/tsx/bell.tsx"
import IconBellRinging from "tabler_icons_tsx/tsx/bell-ringing.tsx"
import IconLogout from "tabler_icons_tsx/tsx/logout.tsx"
import IconHeart from "tabler_icons_tsx/tsx/heart.tsx"
import IconUser from "tabler_icons_tsx/tsx/user.tsx"

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
            <img src="/favicon.ico" />
          </a>
          <a class="text-2xl font-bold " href="/">md-sns</a>
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
                  <div class="relative">
                    <a
                      class="inline-flex items-center hover:cursor-pointer"
                    >
                      <img class="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={props.data.user.picture} alt="" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </a>
                    <div
                      class="absolute right-0 z-10 mt-4 w-56 origin-top-right rounded-md border border-gray-100 bg-white shadow-lg"
                      role="menu"
                    >
                      <div class="flow-root py-2">
                        <div class="-my-2 divide-y divide-gray-100">
                          <div class="p-2">
                            <a
                              href="#"
                              class="flex items-center gap-2  rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              role="menuitem"
                            >
                              <IconUser class="w-6 h-6" />
                              Profile
                            </a>

                            <a
                              href="#"
                              class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              role="menuitem"
                            >
                              <IconHeart class="w-6 h-6" />
                              Likes
                            </a>
                          </div>

                          <div class="p-2">
                            <a
                              href="/signout"
                              class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              role="menuitem"
                            >
                              <IconLogout class="w-6 h-6" />
                              Sign out
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </header>
      <div class="flex justify-center my-2">
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
        </>
        }
      </div>
    </>
  );
}
