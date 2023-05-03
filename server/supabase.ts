import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { get } from "~/server/env.ts";

const supabase = createClient(
  get("SUPABASE_URL"),
  get("SUPABASE_ANON"),
);

export async function selectUserByGoogleId(
  googleId: string,
) {
  const result = await supabase.from("app_user").select().eq(
    "google_id",
    googleId,
  );
  return result.count && result.count > 0 ? result.data[0] : null;
}
