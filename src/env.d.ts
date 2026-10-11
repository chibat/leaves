/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    cfContext: ExecutionContext;
  }
}

declare module "cloudflare:workers" {
  export const env: {
    LEAVES_AUTH_CLIENT_ID: string;
    LEAVES_AUTH_CLIENT_SECRET: string;
    SUPABASE_HOST: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    [key: string]: string;
  };
}
