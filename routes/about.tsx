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
          <li>Markdown で投稿できる SNS のようなものを作成してみました。
            <ul>
              <li>iframe での埋め込みコードは、YouTube と <a href="https://ogp.deno.dev/" target="blank">Open Graph Preview</a> のみサポートしています。</li>
            </ul>
          </li>
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
        </ul>
      </main>
    </>
  );
}
