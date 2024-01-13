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
        <meta property="og:url" content="https://leaves.chiba.dev/"></meta>
        <meta property="og:title" content="Leaves"></meta>
        <meta
          property="og:image"
          content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
        />
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
        <h1>About</h1>
        <ul>
          <li>
            This site is a portfolio by{" "}
            <a
              href="https://chiba.dev"
              target="_blank"
              class="doc"
            >
              @chibat
            </a>.
          </li>
          <li>
            It is a microblog platform that allows you to post in Markdown.
          </li>
          <li>You can sign in using your Google account.</li>
          <li>
            <a href="https://leaves.chiba.dev/posts/75">
              How to write Markdown
            </a>
          </li>
          <li>
            <a href="https://leaves.chiba.dev/posts/177">
              The site previews YouTube URLs included in your posts.
            </a>
          </li>
          <li>
            Production Runtime(built using the following free plan)
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
                </a>(<a
                  href="https://fresh.deno.dev/docs/concepts/ahead-of-time-builds"
                  target="_blank"
                >
                  Build, Deploy
                </a>{" "}
                and{" "}
                <a
                  href="https://supabase.com/docs/guides/cli/github-action/backups"
                  target="_blank"
                >
                  DB Backup
                </a>)
              </li>
              <li>Google OAuth</li>
            </ul>
          </li>
          <li>
            Modules used
            <ul>
              <li>
                See deno.json imports
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
              Source Code
            </a>
          </li>
          <li>
            <a
              href="https://zenn.dev/chiba/articles/md-sns-deno-fresh"
              target="_blank"
            >
              Zenn article
            </a>
          </li>
          <li>
            <a href="/shortcuts">Keyboard Shortcuts</a>
          </li>
          <li>
            <a href="https://leaves.chiba.dev/posts/227">Leaves CLI</a>
          </li>
        </ul>
      </main>
    </>
  );
});
