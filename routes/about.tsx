import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { AppUser } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

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
        <title>About - md-sns</title>
        <meta property="og:url" content="https://md-sns.deno.dev/"></meta>
        <meta property="og:title" content="md-sns"></meta>
        <meta property="og:image" content="https://md-sns.deno.dev/assets/img/icon-192x192.png" />
        <meta name="twitter:card" content="summary"></meta>
        <meta name="twitter:site" content="@tomofummy" />
        <meta name="twitter:creator" content="@tomofummy" />
        <meta name="twitter:image" content="https://md-sns.deno.dev/assets/img/icon-192x192.png" />
      </Head>
      <Header user={props.data.user} />
      <main class="container">
        <h1>About</h1>
        <ul>
          <li>本サイトは、<a href="https://chibat.github.io/" target="_blank" class="doc">@chibat</a> によるポートフォリオです。</li>
          <li>Markdown で投稿できる SNS のようなものを作成してみました。 </li>
          <li>Production Runtime（次の無料枠を利用しています）
            <ul>
              <li><a href="https://deno.com/deploy" target="_blank">Deno Deploy</a>(TypeScript at the Edge)</li>
              <li><a href="https://supabase.com/" target="_blank">Supabase</a>(Postgres database)</li>
              <li>Google OAuth</li>
            </ul>
          </li>
          <li>利用モジュール
            <ul>
              <li><a href="https://github.com/chibat/md-sns7/blob/main/import_map.json" target="_blank">import_map.json を参照</a></li>
              <li><a href="https://getbootstrap.com/" target="_blank">Bootstrap</a></li>
            </ul>
          </li>
          <li><a href="https://github.com/chibat/md-sns7" target="_blank" class="doc">ソースコード</a></li>
          <li><a href="https://zenn.dev/chiba/articles/md-sns-deno-fresh" target="_blank">Zenn 記事</a></li>
        </ul>
        <h2>Keyboard Shortcut</h2>
        <table>
          <tr><td>Search</td><td style={{ textAlign: "right" }}>/</td></tr>
          <tr><td>New Post</td><td style={{ textAlign: "right" }}>n</td></tr>
          <tr><td>Scroll to top</td><td style={{ textAlign: "right" }}>.</td></tr>
          <tr><td>Next Post</td><td style={{ textAlign: "right" }}>j</td></tr>
          <tr><td>Previous Post</td><td style={{ textAlign: "right" }}>k</td></tr>
          <tr><td>Home</td><td style={{ textAlign: "right" }}>gh</td></tr>
          <tr><td>Notification</td><td style={{ textAlign: "right" }}>gn</td></tr>
          <tr><td>Liked</td><td style={{ textAlign: "right" }}>gl</td></tr>
          <tr><td>Following</td><td style={{ textAlign: "right" }}>gf</td></tr>
          <tr><td>Profile</td><td style={{ textAlign: "right" }}>gp</td></tr>
        </table>
      </main>
    </>
  );
}
