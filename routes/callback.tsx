import { Handlers } from "$fresh/server.ts";
import { clientId, clientSecret } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";
import { getTokenByCode } from "~/lib/getTokenByCode.ts";
import { setCookie } from "std/http/cookie.ts";
import { setAccessTokenToCookie } from "~/lib/setAccessTokenToCookie.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get("code");
    const res = await ctx.render();
    if (code) {
      const redirectUri = getCallbackUrl(req.url);

      const { access_token, refresh_token } = await getTokenByCode(
        clientId,
        clientSecret,
        redirectUri,
        code,
      );

      if (access_token) {
        setAccessTokenToCookie(res, access_token);
      }
      if (refresh_token) {
        setCookie(res.headers, {
          name: "refresh",
          value: refresh_token,
          sameSite: "Strict",
          httpOnly: true,
          secure: true,
          path: "/",
        });
      }
    }
    return res;
  },
}

export default function Callback() {
  // response header での redirect だと cookie が送信されない
  return (
    <script>
      location.href = '/';
    </script>
  );
}
