import { create, Payload, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { jwk } from "~/lib/env.ts";

async function importKey() {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
}

const key = await importKey();

export async function serializeJwt(payload: Payload) {
  return await create({ alg: "HS512", typ: "JWT" }, payload, key);
}

export async function deserializeJwt(jwt: string) {
  return await verify(jwt, key);
}

