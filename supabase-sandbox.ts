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
// 複雑なクエリを実行するためには、function や view を作る必要がありそう。

export async function selectUserByGoogleId(
  googleId: string,
) {
  return await supabase.from("app_user")
    .select() // TODO
    .eq(
      "google_id",
      googleId,
    ).maybeSingle();
}

export async function selectUser(
  userId: number,
) {
  return await supabase.from("app_user")
    .select() // TODO
    .eq(
      "id",
      userId,
    ).maybeSingle();
}

export async function selectUsers() {
  const results = await supabase.from("post")
    .select("user_id,max(updated_at)") // TODO
    .order("user_id");

  return results.data;

  //SELECT user_id, max(updated_at) as updated_at FROM post GROUP BY user_id ORDER BY user_id
  //return result.rows;
}

console.log(await selectUsers());
