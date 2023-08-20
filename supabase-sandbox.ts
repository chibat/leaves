import { createClient } from "https://esm.sh/v131/@supabase/supabase-js@2.32.0";
import "$std/dotenv/load.ts";
import { Database } from "~/server/supabase.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON") ?? "";
const supabase = createClient<Database>(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const { data, error } = await supabase
  .from("post")
  .select("id, app_user!post_user_id_fkey(id)");

console.log(JSON.stringify(error));
console.log(JSON.stringify(data));

// 日本語全文検索するためには、DB FUNCTION を作る必要がありそう。
