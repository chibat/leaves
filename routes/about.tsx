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
        <title>About - Leaves</title>
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
        <h1>About</h1>
        <ul>
          <li>
            本サイトは、<a
              href="https://chibat.github.io/"
              target="_blank"
              class="doc"
            >
              @chibat
            </a>{" "}
            によるポートフォリオです。
          </li>
          <li>Markdown で投稿できるマイクロブログです。</li>
          <li>Google アカウントでログインできます。</li>
          <li>
            Production Runtime（次の無料枠を利用しています）
            <ul>
              <li>
                <a href="https://deno.com/deploy" target="_blank">
                  Deno Deploy
                </a>(TypeScript at the Edge)
              </li>
              <li>
                <a href="https://supabase.com/" target="_blank">
                  Supabase
                </a>(Postgres database)
              </li>
              <li>Google OAuth</li>
            </ul>
          </li>
          <li>
            利用モジュール
            <ul>
              <li>
                <a
                  href="https://github.com/chibat/leaves/blob/main/import_map.json"
                  target="_blank"
                >
                  import_map.json を参照
                </a>
              </li>
              <li>
                <a href="https://getbootstrap.com/" target="_blank">
                  Bootstrap
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a
              href="https://github.com/chibat/leaves"
              target="_blank"
              class="doc"
            >
              ソースコード
            </a>
          </li>
          <li>
            <a
              href="https://zenn.dev/chiba/articles/md-sns-deno-fresh"
              target="_blank"
            >
              Zenn 記事
            </a>
          </li>
          <li>
            <a href="/help">Help</a>
          </li>
        </ul>
      </main>
    </>
  );
}
