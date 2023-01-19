import { Handlers } from "$fresh/server.ts";
import { createSession } from "~/lib/auth.ts";

const debug = Deno.env.get("HOSTNAME")?.startsWith("codespaces-");

export const handler: Handlers = {
  async GET(_req, ctx) {
    if (!debug) {
      return ctx.renderNotFound();
    }
    const res = await ctx.render();
    await createSession(res, 1);
    return res;
  },
};

export default function Page() {
  // response header での redirect だと cookie が送信されない
  return (
    <script>
      location.href = '/';
    </script>
  );
}
