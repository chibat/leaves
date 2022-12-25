import { useSignal } from "@preact/signals";
import IconBell from "tabler_icons_tsx/tsx/bell.tsx"
import IconBellRinging from "tabler_icons_tsx/tsx/bell-ringing.tsx"
import IconLogout from "tabler_icons_tsx/tsx/logout.tsx"
import IconHeart from "tabler_icons_tsx/tsx/heart.tsx"
import IconUser from "tabler_icons_tsx/tsx/user.tsx"
import { GoogleUser } from "~/lib/getGoogleUser.ts";
import { useEffect, useRef } from "preact/hooks";

interface CounterProps {
  start: number;
}

export default function Header(props: { authUrl?: string, user?: GoogleUser }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const menuOpen = useSignal(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hundleClickOutside = (e: MouseEvent) => {
      if (!el?.contains(e.target as Node)) {
        // outside
        menuOpen.value = false;
      } else {
        // inside
        menuOpen.value = !menuOpen.value;
      }
    };
    document.addEventListener("click", hundleClickOutside);
    return () => {
      document.removeEventListener("click", hundleClickOutside);
    };
  }, [ref]);

  return (
    <>
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
                {props.user &&
                  <li>
                    <a class="text-gray-500 transition hover:text-gray-400" href="/">
                      Following
                    </a>
                  </li>
                }
              </ul>
            </nav>
            {props.user &&
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
                      ref={ref}
                      class="inline-flex items-center hover:cursor-pointer"
                    >
                      <img class="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={props.user.picture} alt="" />
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
                    {menuOpen.value &&
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
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </header>
      <div class="flex justify-center my-2">
        {!props.user &&
          <a href={props.authUrl} >
            <input type="image" src="/btn_google_signin_dark_pressed_web.png" />
          </a>
        }
      </div>
    </>
  );
}
