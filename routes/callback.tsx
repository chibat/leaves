import { Handlers } from "$fresh/server.ts";
import { env } from "~/server/env.ts";
import { createSession, getCallbackUrl } from "~/server/auth.ts";
import { selectUserByGoogleId, transaction, updateUser, upsertUser } from "~/server/db.ts";

export type Token = { access_token: string; refresh_token: string };

export type GoogleUser = {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get("code");
    const res = await ctx.render();

    if (code) {
      const redirectUri = getCallbackUrl(req.url);

      const tokenResponse = await fetch(
        "https://accounts.google.com/o/oauth2/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams([
            ["client_id", env.clientId],
            ["client_secret", env.clientSecret],
            ["redirect_uri", redirectUri],
            ["grant_type", "authorization_code"],
            ["code", code],
          ]),
        },
      );
      const { access_token } = await tokenResponse.json() as Token;

      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo?" +
        new URLSearchParams([["access_token", access_token]]),
      );
      const googleUser: GoogleUser = await userResponse.json();
      if (userResponse.status !== 200) {
        throw new Error(JSON.stringify(googleUser));
      }

      await fetch(
        "https://accounts.google.com/o/oauth2/revoke?" +
        new URLSearchParams([["token", access_token]]),
      );

      const user = (await selectUserByGoogleId(googleUser.id)).data;
      const appUser = await transaction(async (client) => {
        if (user) {
          if (
            user.name !== googleUser.name || user.picture !== googleUser.picture
          ) {
            await updateUser(client, {
              id: user.id,
              name: googleUser.name,
              picture: googleUser.picture,
            });
          }
          return user;
        }
        return await upsertUser(client, {
          googleId: googleUser.id,
          name: googleUser.name,
          picture: googleUser.picture,
        });
      });

      await createSession(res, appUser.id);
    }
    return res;
  }
}

export default function Callback() {
  // response header での redirect だと cookie が送信されない
  return (
    <script>
      location.href = '/';
    </script>
  );
}
