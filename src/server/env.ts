import { AsyncLocalStorage } from "node:async_hooks";

type RequestEnvironment = {
  env: Record<string, string>;
  values: Map<symbol, unknown>;
};

const requestEnvironment = new AsyncLocalStorage<RequestEnvironment>();

export function withEnvironment<T>(
  values: Record<string, string>,
  callback: () => T,
): T {
  return requestEnvironment.run({ env: values, values: new Map() }, callback);
}

export function getRequestValue<T>(key: symbol, create: () => T): T {
  const store = requestEnvironment.getStore();
  if (!store) {
    return create();
  }
  const existing = store.values.get(key);
  if (existing !== undefined) {
    return existing as T;
  }
  const value = create();
  store.values.set(key, value);
  return value;
}

export function get(name: string): string {
  const value = requestEnvironment.getStore()?.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get clientId() {
    return get("LEAVES_AUTH_CLIENT_ID");
  },
  get clientSecret() {
    return get("LEAVES_AUTH_CLIENT_SECRET");
  },
};
