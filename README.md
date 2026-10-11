![logo](static/assets/img/icon-192x192.png)

# Leaves

Leaves is a Markdown microblog built with Astro and Preact. The web application
runs on Cloudflare Workers and uses Supabase for storage and Google OAuth for
sign-in.

Source code for <https://leaves.chiba.dev/>.

## Development

1. Install Node.js 22.12 or later and run `npm install`.
2. Copy `.example.env` to `.env` and fill in the Google OAuth and Supabase
   settings.
3. Add `http://localhost:8000/callback` as an authorized redirect URI for the
   Google OAuth client, then run `npm run dev` to start the local Astro
   development server at <http://localhost:8000>.
4. Run `npm test`, `npm run check`, and `npm run build` before deploying.

For browser-based regression checks, follow [MANUAL_TESTS.md](./MANUAL_TESTS.md).

## Cloudflare Workers

Set `LEAVES_AUTH_CLIENT_ID`, `LEAVES_AUTH_CLIENT_SECRET`, `SUPABASE_HOST`, and
`SUPABASE_SERVICE_ROLE_KEY` as Worker secrets or environment variables. Deploy
with `npm run deploy`; `npm run preview` runs the built Worker locally.

## Leaves CLI

The standalone CLI remains a Deno program:

```sh
deno install -f -n s --allow-net=leaves.chiba.dev https://raw.githubusercontent.com/chibat/leaves/main/cli.ts
```

## References

- <https://supabase.com/docs/guides/database>
- <https://getbootstrap.com/docs/5.2/getting-started/introduction/>
- <https://astro.build/>
- <https://preactjs.com/>

-------
```
npx wrangler login --device # for Dev Containers
```
