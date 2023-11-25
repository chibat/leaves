import { Pool, PoolClient, Transaction } from "postgres/mod.ts";
import { createClient, SupabaseClient } from "supabase-js";
import * as uuid from "$std/uuid/mod.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import * as env from "~/server/env.ts";
import { Database } from "~/server/database.types.ts";

export type AppUser = Database["public"]["Tables"]["app_user"]["Row"];
export type PostViewTypeA = Database["public"]["Views"]["post_view"]["Row"];

// View の型定義の自動生成はフィールドが全部 null 許可になってしまうので明示的に定義
export type PostViewType = {
  comments: number;
  created_at: string;
  draft: boolean;
  id: number;
  likes: number;
  name: string;
  picture: string | null;
  source: string;
  updated_at: string;
  user_id: number;
};

export type UserViewType = {
  user_id: number;
  updated_at: string;
};

let supabase: SupabaseClient<Database>;

export function initSupabase() {
  const url = "https://" + env.get("SUPABASE_HOST");
  // const anon = env.get("SUPABASE_ANON");
  const serviceRoleKey = env.get("SUPABASE_SERVICE_ROLE_KEY");
  supabase = createClient<Database>(url, serviceRoleKey);
}

export type Client = PoolClient | Transaction;

export type Post = {
  id: number;
  user_id: number;
  source: string;
  updated_at: string;
  created_at: string;
  name?: string; // app_user
  picture?: string; // app_user
  comments: bigint; // comment
  likes: bigint; // likes
  draft: boolean;
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  source: string;
  updated_at: string;
  created_at: string;
  name?: string; // app_user
  picture?: string; // app_user
};

export type AppNotification = {
  id: number;
  user_id: number;
  type: "follow" | "like" | "comment" | null;
  action_user_id: number;
  post_id: number;
  created_at: string;
  name?: string; // app_user
};

let connectionPool: Pool;

export function initPool() {
  // build 時に処理が動かないように初期化を遅延させる
  connectionPool = new Pool(
    {
      tls: {
        enforce: false,
        caCertificates: [
          `-----BEGIN CERTIFICATE-----\n${
            Deno.env.get("MDSNS_DATABASE_CA_CERTIFICATE")
          }\n-----END CERTIFICATE-----`,
        ],
      },
    },
    5,
    true,
  );
}

export async function pool<T>(
  handler: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await connectionPool.connect();
  try {
    return handler(client);
  } catch (error) {
    console.info(JSON.stringify(error));
    await client.end();
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  handler: (client: Client) => Promise<T>,
): Promise<T> {
  const client = await connectionPool.connect();
  const transaction = client.createTransaction(crypto.randomUUID());
  try {
    await transaction.begin();
    const result = await handler(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    console.info(JSON.stringify(error));
    await client.end();
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function selectUserByGoogleId(googleId: string) {
  const { data } = await supabase.from("app_user").select("id,name,picture").eq(
    "google_id",
    googleId,
  ).maybeSingle();
  return data;
}

export async function upsertUser(
  params: { googleId: string; name: string; picture: string },
) {
  const { data } = await supabase.from("app_user").upsert({
    google_id: params.googleId,
    name: params.name,
    picture: params.picture,
  }, { onConflict: "google_id" }).select("id,google_id,name,picture")
    .maybeSingle();
  return data!;
}

export async function deleteUser(
  userId: number,
) {
  await supabase.from("app_user").delete().eq("id", userId);
}

export async function selectUser(userId: number) {
  const { data } = await supabase.from("app_user").select(
    "id,name,picture,notification",
  ).eq(
    "id",
    userId,
  )
    .maybeSingle();
  return data;
}

export async function selectUsers() {
  const { data } = await supabase.from("user_view").select(
    "user_id,updated_at",
  ).returns<UserViewType[]>();
  return data ?? [];
}

export async function insertPost(
  params: { userId: number; source: string; draft: boolean },
): Promise<number> {
  const { data } = await supabase.from("post").insert({
    user_id: params.userId,
    source: params.source,
    draft: params.draft,
  }).select("id").maybeSingle();
  return data?.id!;
}

export async function updatePost(
  params: { postId: number; userId: number; source: string; draft: boolean },
) {
  await supabase.from("post")
    .update({
      id: params.postId,
      source: params.source,
      draft: params.draft,
      updated_at: new Date().toISOString(),
    }).match({ "id": params.postId, "user_id": params.userId });
}

export async function deletePost(
  params: { id: number; userId: number },
) {
  await supabase.from("post").delete().match({
    "id": params.id,
    "user_id": params.userId,
  });
}

export async function selectPost(id: number) {
  const { data } = await supabase.from("post_view").select("*").eq("id", id)
    .returns<PostViewType[]>()
    .maybeSingle();
  return data;
}

export async function selectPostIds() {
  const { data } = await supabase.from("post").select("id,updated_at").eq(
    "draft",
    false,
  ).order(
    "id",
    { ascending: false },
  ).limit(1000);
  return data ?? [];
}

export async function selectPosts(ltId: number | null) {
  const builder = supabase.from("post_view").select("*").eq("draft", false);
  if (ltId) {
    builder.lt("id", ltId);
  }
  const { data } = await builder.order("id", { ascending: false }).limit(
    PAGE_ROWS,
  ).returns<PostViewType[]>();
  return data ?? [];
}

export async function selectUserPost(
  params: { userId: number; self: boolean; ltId: number | null },
) {
  const builder = supabase.from("post_view").select("*").eq(
    "user_id",
    params.userId,
  );
  if (!params.self) {
    builder.eq("draft", false);
  }
  if (params.ltId) {
    builder.lt("id", params.ltId);
  }
  const { data } = await builder.order("id", { ascending: false }).limit(
    PAGE_ROWS,
  ).returns<PostViewType[]>();
  return data ?? [];
}

export async function selectFollowingUsersPosts(
  params: { userId: number; ltId: number | null },
) {
  const { data } = await supabase.rpc("select_following_users_posts", {
    login_user_id: params.userId,
    post_id: params.ltId!,
  });
  return data ?? [];
}

export async function selectLikedPosts(
  params: { userId: number; ltId: number | null },
) {
  const { data } = await supabase.rpc("select_liked_posts", {
    login_user_id: params.userId,
    post_id: params.ltId!,
  });
  return data ?? [];
}

export async function selectPostsBySearchWord(
  params: {
    searchWord: string;
    postId: number | null;
    loginUserId: number | null;
  },
) {
  const searchWord = params.searchWord.trim();
  if (searchWord.trim().length === 0) {
    return [];
  }
  const { data } = await supabase.rpc("select_posts_by_word", {
    search_word: searchWord,
    login_user_id: params.loginUserId!,
    post_id: params.postId!,
  });
  console.log("selectPostsBySearchWord", params, data);
  return data ?? [];
}

export async function insertComment(
  params: { postId: number; userId: number; source: string },
) {
  await supabase.from("comment").insert({
    "post_id": params.postId,
    "user_id": params.userId,
    "source": params.source,
  });

  supabase.rpc("insert_notification_for_comment", {
    p_post_id: params.postId,
    p_user_id: params.userId,
  }).then(({ error }) => {
    if (error) {
      console.log(error);
    }
  });
}

export async function selectComments(
  postId: number,
) {
  const { data } = await supabase.from("comment").select(
    "id,user_id,source,updated_at,app_user(name,picture)",
  ).eq("post_id", postId).order("id").limit(100);
  return data ?? [];
}

export async function deleteComment(
  params: { id: number; userId: number },
): Promise<void> {
  await supabase.from("comment").delete().match({
    id: params.id,
    user_id: params.userId,
  });
}

export async function insertFollow(
  params: { userId: number; followingUserId: number },
): Promise<void> {
  await supabase.from("follow").insert({
    "user_id": params.userId,
    "following_user_id": params.followingUserId,
  });

  await supabase.from("notification").insert({
    "user_id": params.followingUserId,
    "type": "follow",
    action_user_id: params.userId,
  });

  await supabase.from("app_user").update({ notification: true }).eq(
    "id",
    params.followingUserId,
  );
}

export async function deleteFollow(
  params: { userId: number; followingUserId: number },
): Promise<void> {
  await supabase.from("follow").delete().match({
    "user_id": params.userId,
    "following_user_id": params.followingUserId,
  });
}

export async function selectFollowingUsers(userId: number) {
  const { data } = await supabase.from("follow").select(
    "user:following_user_id(id,name,picture)",
  ).eq(
    "user_id",
    userId,
  )
    .order("created_at", { ascending: false }).returns<
    { user: { id: number; name: string; picture: string } }[]
  >();
  return data!.map((row) => row.user);
}

export async function selectFollowerUsers(followingUserId: number) {
  const { data } = await supabase.from("follow").select(
    "user:user_id(id,name,picture)",
  )
    .eq(
      "following_user_id",
      followingUserId,
    )
    .order("created_at", { ascending: false }).returns<
    { user: { id: number; name: string; picture: string } }[]
  >();
  return data!.map((row) => row.user);
}

export async function selectCountFollowing(userId: number): Promise<string> {
  const { count } = await supabase.from("follow").select("user_id", {
    count: "exact",
  }).eq("user_id", userId);
  return "" + count;
}

export async function selectCountFollower(
  followingUserId: number,
): Promise<string> {
  const { count } = await supabase.from("follow").select("user_id", {
    count: "exact",
  }).eq("following_user_id", followingUserId);
  return "" + count;
}

export async function judgeFollowing(
  params: { userId: number; followingUserId: number },
): Promise<boolean> {
  const result = await supabase.from("follow").select("user_id").match({
    "user_id": params.userId,
    "following_user_id": params.followingUserId,
  });
  return result.data?.length === 1;
}

export async function selectNotificationsWithUpdate(userId: number) {
  const { data } = await supabase.from("notification").select(
    "id,type,action_user_id,post_id,created_at,action_user:action_user_id(name)",
  ).eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
    .returns<
      {
        id: number;
        type: string;
        post_id: number;
        action_user_id: number;
        created_at: string;
        action_user: { name: string };
      }[]
    >();

  try {
    // TODO async for performance
    await supabase.from("app_user").update({ "notification": false }).eq(
      "id",
      userId,
    );
  } catch (error) {
    console.error(error);
  }

  return data ?? [];
}

export async function insertLike(
  params: { userId: number; postId: number },
) {
  await supabase.from("likes").insert({
    "user_id": params.userId,
    "post_id": params.postId,
  });

  supabase.rpc("insert_notification_for_like", {
    p_post_id: params.postId,
    p_user_id: params.userId,
  }).then(({ error }) => {
    if (error) {
      console.log(error);
    }
  });
}

export async function deleteLike(
  params: { userId: number; postId: number },
): Promise<void> {
  await supabase.from("likes").delete().match({
    "post_id": params.postId,
    "user_id": params.userId,
  });
}

export async function selectLikes(
  { userId, postIds }: { userId: number; postIds: number[] },
) {
  const { data } = await supabase.from("likes").select("post_id").eq(
    "user_id",
    userId,
  ).in("post_id", postIds);
  return data?.map((row) => row.post_id) ?? [];
}

export async function selectLikeUsers(postId: number) {
  const { data } = await supabase.from("likes").select(
    "app_user(id,name,picture)",
  ).eq(
    "post_id",
    postId,
  ).order("created_at", { ascending: false });
  if (!data) {
    return [];
  }
  return data.map((row) => row.app_user!);
}

export async function selectSession(sessionId: string) {
  if (!uuid.validate(sessionId)) {
    return undefined;
  }
  const { data } = await supabase.from("app_session").select(
    "app_user(id,name,picture,notification)",
  ).eq(
    "id",
    sessionId,
  ).maybeSingle();
  if (!data) {
    return undefined;
  }
  return data.app_user;
}

export async function insertSession(userId: number): Promise<string> {
  const { data } = await supabase.from("app_session").insert({
    user_id: userId,
  })
    .select("id").maybeSingle();
  const sessionId = data?.id;
  await deleteExpiredSession(userId);
  return sessionId!;
}

export async function deleteSession(
  session: { id: string; user: { id: number } },
): Promise<void> {
  await supabase.from("app_session").delete().match({ id: session.id });
  await deleteExpiredSession(session.user.id);
}

/**
 * 作成後、1ヶ月経過しているセッションを削除する
 * TODO セッション取得時に updated_at を更新するか？
 *
 * @param userId
 */
export async function deleteExpiredSession(userId: number): Promise<void> {
  try {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    await supabase.from("app_session").delete().eq("user_id", userId).lt(
      "updated_at",
      date.toISOString(),
    );
  } catch (ignore) {
    console.error(ignore);
  }
}
