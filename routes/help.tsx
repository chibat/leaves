import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { AppUser } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

type PageType = { user?: AppUser };

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const res = await ctx.render({ user: session?.user });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <>
      <Head>
        <title>Help - Leaves</title>
        <meta property="og:url" content="https://leaves.deno.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta
          property="og:image"
          content="https://leaves.deno.dev/assets/img/icon-192x192.png"
        />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta
          name="twitter:image"
          content="https://leaves.deno.dev/assets/img/icon-192x192.png"
        />
      </Head>
      <Header user={props.data.user} />
      <main class="container">
        <h1>Help</h1>
        <h2>Keyboard Shortcut</h2>
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
                <td>Help</td>
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
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
