import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getGoogleUser, GoogleUser } from "~/lib/getGoogleUser.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";
import Header from "~/islands/Header.tsx";
import Post from "~/islands/Post.tsx";

export const handler: Handlers<{ authUrl?: string, user?: GoogleUser }> = {
  async GET(req, ctx) {
    const { googleUser, access_token } = await getGoogleUser(req);
    if (!googleUser) {
      // return new Response("Unauthorized", { status: 401 });
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const res = await ctx.render({ user: googleUser });
    if (access_token) {
      setAccessTokenToCookie(res, access_token);
    }
    return res;
  },
};

export default function Page(props: PageProps<{ user?: GoogleUser }>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.user} />
      <div class="p-4 mx-auto max-w-screen-md">
        <Post />
      </div>
    </>
  );
}
