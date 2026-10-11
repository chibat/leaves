import type { Handlers } from "~/server/route.ts";
import { createSession } from "~/server/auth.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    if (import.meta.env.MODE !== "development") {
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
