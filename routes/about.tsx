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
      <Header user={session?.user} authUrl={authUrl} />
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
          <li>投稿した本文の YouTube の URL は、プレビューされます。</li>
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
              <li>
                <a href="https://github.com/features/actions" target="_blank">
                  GitHub Actions
                </a>(Deploy and DB Backup)
              </li>
              <li>Google OAuth</li>
            </ul>
          </li>
          <li>
            利用モジュール
            <ul>
              <li>
                deno.json imports を参照
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
            <a href="/help">Keyboard Shortcuts</a>
          </li>
        </ul>
      </main>
    </>
  );
});
