import { serializeJwt, deserializeJwt } from "~/lib/jwt.ts";

const jwt = await serializeJwt({ foo: "bar" });
console.log(jwt);

const payload = await deserializeJwt(jwt);
console.log(payload);
