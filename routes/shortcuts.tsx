import { Head } from "$fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/server/auth.ts";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  const authUrl = session ? undefined : getAuthUrl(req.url);
  return (
    <>
      <Head>
        <title>Keyboard Shortcuts - Leaves</title>
        <meta property="og:url" content="https://leaves.chiba.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta
          name="twitter:image"
          content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
        />
      </Head>
      <Header user={session?.user} authUrl={authUrl} />
      <main class="container">
        <h1>
          <img
            src="/assets/img/question-circle-fill.svg"
            alt="Edit"
            width="32"
            height="32"
            class="me-2"
          >
          </img>
          Keyboard Shortcuts
        </h1>
        <div class="post">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Mappings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Keyboard Shortcuts</td>
                <td>?</td>
              </tr>
              <tr>
                <td>Search</td>
                <td>/</td>
              </tr>
              <tr>
                <td>New Post</td>
                <td>n</td>
              </tr>
              <tr>
                <td>Scroll to top</td>
                <td>.</td>
              </tr>
              <tr>
                <td>Next Post</td>
                <td>j</td>
              </tr>
              <tr>
                <td>Previous Post</td>
                <td>k</td>
              </tr>
              <tr>
                <td>Open Post</td>
                <td>o</td>
              </tr>
              <tr>
                <td>Edit Post</td>
                <td>e</td>
              </tr>
              <tr>
                <td>About</td>
                <td>ga</td>
              </tr>
              <tr>
                <td>Home</td>
                <td>gh</td>
              </tr>
              <tr>
                <td>Notification</td>
                <td>gn</td>
              </tr>
              <tr>
                <td>Liked</td>
                <td>gl</td>
              </tr>
              <tr>
                <td>Following</td>
                <td>gf</td>
              </tr>
              <tr>
                <td>Profile</td>
                <td>gp</td>
              </tr>
              <tr>
                <td>Send/Save Post</td>
                <td>(CTRL|⌘)+Enter</td>
              </tr>
              <tr>
                <td>Switch between Preview and Edit</td>
                <td>(CTRL|⌘)+p</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
});
