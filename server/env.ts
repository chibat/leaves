export function get(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    console.error("Cannot get the environment variable: " + name);
    Deno.exit(1);
  }
  return value;
}

export const clientId = get("LEAVES_AUTH_CLIENT_ID");
export const clientSecret = get("LEAVES_AUTH_CLIENT_SECRET");
