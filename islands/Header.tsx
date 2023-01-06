import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { AppUser } from "~/lib/db.ts";

export default function Header(props: { user?: AppUser, authUrl?: string }) {
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
      <header class="py-3 mb-3 border-bottom bg-white">
        <div class="container-fluid d-grid gap-3 align-items-center" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <img src="/assets/img/icon-192x192.png" width="32" class="me-2" alt="md-sns" />
            <a class="fs-4 me-3 noDecoration" href="/">md-sns</a>
            <a class="me-3 noDecoration" href="/">Home</a>
            {props.user &&
              <>
                <a class="me-3 noDecoration" href="/following">Following</a>
                <a class="me-3 noDecoration" href="/likes">Likes</a>
              </>
            }
          </div>
          <div class="d-flex align-items-center ms-auto">
            <a class="me-3 noDecoration" href="/about">About</a>
            {props.user &&
              <>
                <a href="/notification">
                  {!props.user.notification &&
                    <img alt="bell" src="/assets/img/bell.png" width="20px" class="me-3" />
                  }
                  {props.user.notification &&
                    <img alt="bell" src="/assets/img/bell2.png" width="20px" class="me-3" />
                  }
                </a>
                <div class="flex-shrink-0 dropdown">
                  <a href={void (0)} class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false"
                    style={{ cursor: "pointer" }}>
                    <img src={props.user.picture} alt="mdo" width="32" height="32" class="rounded-circle" />
                  </a>
                  <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                    <li><a class="dropdown-item" href={`/users/${props.user.id}`}>Profile</a></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li><a class="dropdown-item" href="/signout">Sign out</a></li>
                  </ul>
                </div>
              </>
            }
          </div>
        </div>
      </header>
      {!props.user && props.authUrl &&
        <div style={{ textAlign: "center" }}>
          <a href={props.authUrl} >
            <input type="image" src="/btn_google_signin_dark_pressed_web.png" />
          </a>
        </div>
      }
    </>
  );
}
