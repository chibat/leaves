import { z } from "zod";
import { defineEnv } from "void/env";

export default defineEnv({
  LEAVES_AUTH_CLIENT_ID: z.string().min(1),
  LEAVES_AUTH_CLIENT_SECRET: z.string().min(1),
  SUPABASE_HOST: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});
