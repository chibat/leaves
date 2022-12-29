import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "~/islands/Header.tsx";
import { getAuthUrl, getSession } from "~/lib/auth.ts";
import { AppUser } from "~/lib/db.ts";

export const handler: Handlers<{ authUrl?: string, user?: AppUser }> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    const authUrl = session ? undefined : getAuthUrl(req.url);
    const res = await ctx.render({ user: session?.u, authUrl });
    return res;
  },
};

export default function Page(props: PageProps<{ user?: AppUser, authUrl: string }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.user} authUrl={props.data.authUrl} />
      <div class="p-4 mx-auto max-w-screen-md">
        post
      </div>
    </>
  );
}
