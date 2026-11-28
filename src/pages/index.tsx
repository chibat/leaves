import type { Props } from "./index.server.ts";
import AllPosts from "~/islands/AllPosts.tsx";
import { Link } from "@void/react";

export default function Home({ session, posts, title }: Props) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={title} />
      <meta property="og:url" content="https://leaves.chiba.dev/" />
      <meta property="og:title" content="Leaves" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@tomofummy" />
      <meta name="twitter:creator" content="@tomofummy" />
      <meta
        name="twitter:image"
        content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
      />
      <main className="container">
        {!session?.user && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="px-4 py-5 my-5 text-center">
                <img
                  className="d-block mx-auto mb-4"
                  src="/assets/img/icon-192x192.png"
                  alt="Leaves"
                  width="100"
                />
                <h1 className="display-5 fw-bold text-body-emphasis">
                  Leaves
                </h1>
                <div className="col-lg-6 mx-auto">
                  <p className="lead mb-4">
                    This website is a Microblog that allows you to post in{" "}
                    <b>Markdown</b>.<br />
                    Sign in with your Google account and use it.
                  </p>
                  <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <div style={{ textAlign: "center" }}>
                      <a href="/auth">
                        <input
                          type="image"
                          src="/btn_google_signin_dark_pressed_web.png"
                          alt="Sign in with Google"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="card mb-3">
          <div className="card-body">
            {session?.user?.picture && (
              <img
                src={session.user.picture}
                alt="mdo"
                width="32"
                height="32"
                referrerPolicy="no-referrer"
                className="rounded-circle me-2"
              />
            )}
            <Link href="/posts/new">
              <input
                className="form-control"
                type="text"
                placeholder="Write with Markdown"
                aria-label="Post"
                readOnly
                style={{ cursor: "pointer", width: "90%", display: "inline" }}
              />
            </Link>
          </div>
        </div>
        <AllPosts loginUserId={session?.user.id} initialPosts={posts} />
      </main>
    </>
  );
}
