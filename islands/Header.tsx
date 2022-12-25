import { useSignal } from "@preact/signals";
import IconBell from "tabler_icons_tsx/tsx/bell.tsx"
import IconBellRinging from "tabler_icons_tsx/tsx/bell-ringing.tsx"
import IconLogout from "tabler_icons_tsx/tsx/logout.tsx"
import IconHeart from "tabler_icons_tsx/tsx/heart.tsx"
import IconUser from "tabler_icons_tsx/tsx/user.tsx"
import { GoogleUser } from "~/lib/getGoogleUser.ts";
import { useEffect, useRef } from "preact/hooks";

export default function Header(props: { authUrl?: string, user?: GoogleUser }) {
  const userMenuRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const mobileMenuOpen = useSignal(false);
  const userMenuOpen = useSignal(false);

  useEffect(() => {
    const el = userMenuRef.current;
    if (!el) return;
    const hundleClickOutside = (e: MouseEvent) => {
      if (!el?.contains(e.target as Node)) {
        // outside
        userMenuOpen.value = false;
      } else {
        // inside
        userMenuOpen.value = !userMenuOpen.value;
      }
    };
    document.addEventListener("click", hundleClickOutside);
    return () => {
      document.removeEventListener("click", hundleClickOutside);
    };
  }, [userMenuRef]);

  useEffect(() => {
    const el = mobileMenuRef.current;
    if (!el) return;
    const hundleClickOutside = (e: MouseEvent) => {
      if (!el?.contains(e.target as Node)) {
        // outside
        mobileMenuOpen.value = false;
      } else {
        // inside
        mobileMenuOpen.value = !mobileMenuOpen.value;
      }
    };
    document.addEventListener("click", hundleClickOutside);
    return () => {
      document.removeEventListener("click", hundleClickOutside);
    };
  }, [mobileMenuRef]);

  return (
    <>
      <nav class="bg-white border-b border-gray-100">
        <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div class="relative flex h-16 items-center justify-between">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                ref={mobileMenuRef}
                type="button"
                class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 focus:outline-none "
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span class="sr-only">Open main menu</span>
                {!mobileMenuOpen.value &&
                  <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                }

                {mobileMenuOpen.value &&
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              </button>
            </div>
            <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div class="flex flex-shrink-0 items-center">
                <img class="block h-8 w-auto lg:hidden" src="/favicon.ico" alt="Your Company" />
                <img class="hidden h-8 w-auto lg:block" src="/favicon.ico" alt="Your Company" />
                <a class="text-2xl font-bold px-1" href="/">md-sns</a>
              </div>
              <div class="hidden sm:ml-6 sm:block">
                <div class="flex space-x-4">
                  <a href="#" class="text-gray-500 hover:text-gray-400 py-2">About</a>
                  <a href="/" class="text-gray-500 hover:text-gray-400 py-2">All</a>
                  {props.user && <>
                    <a href="#" class="text-gray-500 hover:text-gray-400 py-2">Following</a>
                    <a href="#" class="text-gray-500 hover:text-gray-400 py-2">Likes</a>
                  </>}
                </div>
              </div>
            </div>
            {props.user &&
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <a class="py-2.5" href="/">
                  <IconBell class="w-6 h-6" />
                </a>
                <a class="py-2.5" href="/">
                  <IconBellRinging class="w-6 h-6" />
                </a>

                <div class="relative ml-3">
                  <a ref={userMenuRef}
                    class="inline-flex items-center hover:cursor-pointer"
                  >
                    <img class="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={props.user.picture} alt="" />
                    {/* <svg
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
                    </svg> */}
                  </a>
                  {userMenuOpen.value &&
                    <div
                      class="absolute right-0 z-10 mt-4 w-56 origin-top-right rounded-md border border-gray-100 bg-white shadow-lg"
                      role="menu"
                    >
                      <div class="flow-root py-2">
                        <div class="-my-2">
                          <div class="p-2">
                            <a
                              href="#"
                              class="flex items-center gap-2  rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              role="menuitem"
                            >
                              <IconUser class="w-6 h-6" />
                              Profile
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
            }
          </div>
        </div>
        {mobileMenuOpen.value &&
          <div class="sm:hidden" id="mobile-menu">
            <div class="space-y-1 px-2 pt-2 pb-3">
              <a href="#" class="text-gray-500 hover:text-gray-400 block px-3 py-2">About</a>
              <a href="/" class="text-gray-500 hover:text-gray-400 block px-3 py-2">All</a>
              {props.user && <>
                <a href="#" class="text-gray-500 hover:text-gray-400 block px-3 py-2">Following</a>
                <a href="#" class="text-gray-500 hover:text-gray-400 block px-3 py-2">Likes</a>
              </>
              }
            </div>
          </div>
        }
      </nav>
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
