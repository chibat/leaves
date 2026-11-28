import type { Props } from "./[userId].server.ts";
import UserPosts from "~/islands/UserPosts.tsx";

export default function UserPage({
  pageUser,
  posts,
  loginUserId,
  title,
  rssUrl,
}: Props) {
  const picture = pageUser?.picture ?? "";
  return (
    <>
      <title>{title}</title>
      {pageUser && (
        <>
          <meta name="description" content={title} />
          <meta property="og:url" content="https://leaves.chiba.dev/" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={title} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@tomofummy" />
          <meta name="twitter:image" content={picture} />
          <link
            rel="alternate"
            type="application/rss+xml"
            href={rssUrl}
          />
        </>
      )}
      <main className="container">
        {pageUser
          ? (
            <>
              <h1>
                <img
                  src={picture}
                  className="img-thumbnail"
                  alt=""
                  referrerPolicy="no-referrer"
                />{" "}
                {pageUser.name}
              </h1>
              <UserPosts
                pageUserId={pageUser.id}
                loginUserId={loginUserId}
                initialPosts={posts}
              />
            </>
          )
          : <h1>404 Not Found</h1>}
      </main>
    </>
  );
}
