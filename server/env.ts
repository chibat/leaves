export function get(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    console.error("Cannot get the environment variable: " + name);
    Deno.exit(1);
  }
  return value;
}

class Env {
  #clientId?: string;
  #clientSecret?: string;
  init() {
    // build 時に処理が動かないように初期化を遅延させる
    this.#clientId = get("LEAVES_AUTH_CLIENT_ID");
    this.#clientSecret = get("LEAVES_AUTH_CLIENT_SECRET");
  }
  get clientId() {
    return this.#clientId!;
  }
  get clientSecret() {
    return this.#clientSecret!;
  }
}

export const env = new Env();
