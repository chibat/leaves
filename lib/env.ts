const maybeClientId = Deno.env.get("MDSNS_AUTH_CLIENT_ID");
if (!maybeClientId) {
  Deno.exit(1);
}

const maybeClientSecret = Deno.env.get("MDSNS_AUTH_CLIENT_SECRET");
if (!maybeClientSecret) {
  Deno.exit(2);
}

const jwkString = Deno.env.get("MDSNS_JWK");
if (!jwkString) {
  Deno.exit(3);
}

export const clientId = maybeClientId;
export const clientSecret = maybeClientSecret;
export const jwk = JSON.parse(jwkString);
