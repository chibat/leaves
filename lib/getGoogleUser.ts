import { getCookies } from "std/http/cookie.ts";
import { clientId, clientSecret } from "~/lib/env.ts";
import { getCallbackUrl } from "~/lib/getCallbackUrl.ts";

export type GoogleUser = {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export async function getGoogleUser(
  request: Request,
): Promise<{ googleUser: GoogleUser; access_token: string | null } | null> {
  const cookies = getCookies(request.headers);

  const accessToken = cookies["access"];
  if (accessToken) {
    try {
      const googleUser = await getUserByAccessToken(accessToken);
      if (googleUser) {
        return { googleUser, access_token: null };
      }
    } catch (_ignore) {
      // ignore
    }
  }
  const refreshToken = cookies["refresh"];
  if (refreshToken) {
    const redirectUri = getCallbackUrl(request.url);

    const { access_token } =
      await (await fetch("https://accounts.google.com/o/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams([
          ["client_id", clientId],
          ["client_secret", clientSecret],
          ["redirect_uri", redirectUri],
          ["grant_type", "refresh_token"],
          ["refresh_token", refreshToken],
        ]),
      })).json();

    if (access_token) {
      const googleUser = await getUserByAccessToken(access_token);
      if (googleUser) {
        return { googleUser, access_token };
      }
    }
  }
  return null;
}

async function getUserByAccessToken(accessToken: string): Promise<GoogleUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?" +
      new URLSearchParams([["access_token", accessToken]]),
  );
  const json: GoogleUser = await response.json();
  if (response.status === 200) {
    return json;
  }
  throw new Error(JSON.stringify(json));
}
