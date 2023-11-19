import { useEffect } from "preact/hooks";
import { AppUser } from "~/server/db.ts";
import { shortcut } from "~/client/shortcut.ts";
import { DEFAULT_AVATOR } from "~/common/constants.ts";

export default function Header(props: { user?: AppUser; authUrl?: string }) {
  useEffect(() => {
    shortcut();
  }, []);

  return (
    <nav
      class="navbar navbar-expand-lg mb-3"
      style={{
        backgroundColor: "#ffffff",
        borderBottomStyle: "solid",
        borderBottomWidth: "0.5px",
        borderBottomColor: "var(--bs-border-color-translucent)",
      }}
    >
      <div class="container-fluid">
        <img
          src="/assets/img/icon-192x192.png"
          width="39"
          class="me-2"
          alt="Leaves"
        />
        <a class="navbar-brand" href="/">Leaves</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link noDecoration" href="/">Home</a>
            </li>
            {props.user &&
              (
                <li class="nav-item">
                  <a class="nav-link noDecoration" href="/following">
                    Following
                  </a>
                </li>
              )}
            <li>
              <a class="nav-link noDecoration" href="/about">About</a>
            </li>
          </ul>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="noDecoration nav-link" href="/search" title="Search">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  class="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="noDecoration nav-link"
                href="/posts/new"
                title="New Post"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  class="bi bi-file-earmark-plus-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z" />
                </svg>
              </a>
            </li>
            {props.user &&
              (
                <>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      href="/notification"
                      title="Notification"
                    >
                      {!props.user.notification &&
                        (
                          <img
                            alt="bell"
                            src="/assets/img/bell.png"
                            width="20px"
                            class="me-3"
                          />
                        )}
                      {props.user.notification &&
                        (
                          <img
                            alt="bell"
                            src="/assets/img/bell2.png"
                            width="20px"
                            class="me-3"
                          />
                        )}
                    </a>
                  </li>
                  <li class="nav-item dropdown">
                    <a
                      class="nav-link dropdown-toggle"
                      href="#"
                      id="navbarDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <img
                        src={props.user.picture ?? DEFAULT_AVATOR}
                        alt="mdo"
                        width="32"
                        height="32"
                        class="rounded-circle"
                        referrerpolicy="no-referrer"
                      />
                    </a>
                    <ul
                      class="dropdown-menu dropdown-menu-end"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <a
                          class="dropdown-item"
                          href={`/users/${props.user.id}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-person-fill me-2"
                            viewBox="0 0 16 16"
                          >
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          </svg>
                          Profile
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="/likes">
                          <img
                            src="/assets/img/heart-fill.svg"
                            alt="Edit"
                            width="16"
                            height="16"
                            class="me-2"
                          >
                          </img>
                          Likes
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="/settings">
                          <img
                            src="/assets/img/gear-fill.svg"
                            alt="Settings"
                            width="16"
                            height="16"
                            class="me-2"
                          />
                          Settings
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="/help">
                          <img
                            src="/assets/img/question-circle-fill.svg"
                            alt="Edit"
                            width="16"
                            height="16"
                            class="me-2"
                          >
                          </img>
                          Help
                        </a>
                      </li>
                      <li>
                        <hr class="dropdown-divider" />
                      </li>
                      <li>
                        <a class="dropdown-item" href="/signout">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-door-closed-fill me-2"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                          </svg>
                          Sign out
                        </a>
                      </li>
                    </ul>
                  </li>
                </>
              )}
            {!props.user &&
              (
                <li class="nav-item">
                  <a class="nav-link noDecoration" href={props.authUrl}>
                    Sign in
                  </a>
                </li>
              )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
