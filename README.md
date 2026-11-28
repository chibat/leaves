![logo](static/assets/img/icon-192x192.png)

# Leaves

Leaves is a Markdown microblog built with Void and React. The web application
runs on Cloudflare Workers and uses Supabase for storage and Google OAuth for
sign-in.

Source code for <https://leaves.chiba.dev/>.

Pages use Void's file-based routing under `src/pages/`, with server loaders
providing initial data to React-rendered and hydrated pages. API endpoints use
Void's file-based routing under `src/routes/`.
Application code is organized under `src/`: shared UI in `components/`,
interactive islands in `islands/`, browser code in `client/`, and server/data
code in `server/`. The `~` import alias points to `src/`.

## Development

1. Install Node.js 24.22 or later and run `npm install`.
2. Copy `.example.env` to `.env` and fill in the Google OAuth and Supabase
   settings.
3. Add `http://localhost:8000/callback` as an authorized redirect URI for the
   Google OAuth client, then run `npm run dev` to start the local Void
   development server at <http://localhost:8000>.
4. Run `npm test`, `npm run check`, and `npm run build` before deploying with
   `npm run deploy`.

For browser-based regression checks, follow [MANUAL_TESTS.md](./MANUAL_TESTS.md).

## Cloudflare Workers

Set the four server-side values declared in `src/env.ts` as Cloudflare Worker
secrets with `void secret put`. Use `void env check` to validate local `.env`
values. Run `npm run preview` to preview the production build locally.
`npm run deploy` deploys through Void to Cloudflare; `npm run upload` uses the
Void build and Wrangler to upload a version at
`staging-<worker>.<subdomain>.workers.dev` without shifting production traffic.
The staging version still uses the Worker's production resources and is subject
to Cloudflare's version retention. Use `npm run upload -- --dry-run` to check
the upload without publishing a version.

## Leaves CLI

After the CLI package is published, run it with Node.js:

```sh
npx @chibat/leaves
```

Pass `dev` to connect to a local server at `http://localhost:8000`:

```sh
npx @chibat/leaves dev
```

The package can be built and published from `cli-package/`:

```sh
npm run build:cli
cd cli-package
npm publish --access public
```

## References

- <https://supabase.com/docs/guides/database>
- <https://getbootstrap.com/docs/5.2/getting-started/introduction/>
- <https://void.cloud/>
- <https://react.dev/>

-------
```
npx wrangler login --device # for Dev Containers
```
