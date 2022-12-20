const maybeClientId = Deno.env.get("APP_AUTH_CLIENT_ID");
if (!maybeClientId) {
  Deno.exit(1);
}

const maybeClientSecret = Deno.env.get("APP_AUTH_CLIENT_SECRET");
if (!maybeClientSecret) {
  Deno.exit(2);
}

export const clientId = maybeClientId;
export const clientSecret = maybeClientSecret;
