export type Token = { access_token: string; refresh_token: string };

export async function getTokenByCode(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
): Promise<Token> {

  const response = await fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([
      ["client_id", clientId],
      ["client_secret", clientSecret],
      ["redirect_uri", redirectUri],
      ["grant_type", "authorization_code"],
      ["code", code],
    ]),
  });

  return await response.json();
}
