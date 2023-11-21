import { Pool, PoolClient, Transaction } from "postgres/mod.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import { SessionType } from "~/server/auth.ts";
import * as uuid from "$std/uuid/mod.ts";
import { QueryBuilder } from "./query_builder.ts";
import * as env from "~/server/env.ts";
import { createClient, SupabaseClient } from "supabase-js";
import { Database } from "~/server/database.types.ts";

export type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

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
  comments?: string; // comment
  likes: string; // likes
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

export async function selectUsers(
  client: Client,
): Promise<Post[]> {
  // TODO view かな。
  const result = await client.queryObject<Post>`
  SELECT user_id, max(updated_at) as updated_at FROM post GROUP BY user_id ORDER BY user_id
    `;
  return result.rows;
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

const SELECT_POST = `
  SELECT
    p.*,
    u.name, u.picture,
    (SELECT count(*) || '' as comments FROM comment WHERE post_id=p.id),
    (SELECT count(*) || '' as likes FROM likes WHERE post_id=p.id)
  FROM post p
  LEFT JOIN app_user u ON (p.user_id = u.id)
`;

export async function selectPost(
  client: Client,
  id: number,
): Promise<Post | null> {
  const result = await client.queryObject<Post>(
    `${SELECT_POST}
      WHERE p.id=$1`,
    [id],
  );
  return result.rowCount ? result.rows[0] : null;
}

export async function selectPostIds() {
  const { data } = await supabase.from("post").select("id,updated_at").eq(
    "draft",
    false,
  ).order(
    "id",
    { ascending: false },
  ).limit(1000);
  return data!;
}

export async function selectPosts(
  client: Client,
  ltId?: number,
): Promise<Array<Post>> {
  const builder = new QueryBuilder().append(SELECT_POST).append(
    "WHERE p.draft = false",
  );
  if (ltId) {
    builder.append`AND p.id < ${ltId}`;
  }
  builder.append(`ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`);
  const result = await client.queryObject<Post>(
    builder.query,
    builder.args,
  );
  return result.rows;
}

export async function selectUserPost(
  client: Client,
  params: { userId: number; self: boolean; ltId?: number },
): Promise<Array<Post>> {
  const builder = new QueryBuilder()
    .append(SELECT_POST)
    .append`WHERE p.user_id = ${params.userId}`;
  if (!params.self) {
    builder.append`AND p.draft = false`;
  }
  if (params.ltId) {
    builder.append`AND p.id < ${params.ltId}`;
  }
  builder.append(`ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`);
  const result = await client.queryObject<Post>(
    builder.query,
    builder.args,
  );
  return result.rows;
}

export async function selectFollowingUsersPosts(
  client: Client,
  params: { userId: number; ltId?: number },
): Promise<Array<Post>> {
  const builder = new QueryBuilder()
    .append(SELECT_POST)
    .append`WHERE p.draft = false AND  p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = ${params.userId})`;
  if (params.ltId) {
    builder.append`AND p.id < ${params.ltId}`;
  }
  builder.append(`ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`);
  const result = await client.queryObject<Post>(
    builder.query,
    builder.args,
  );
  return result.rows;
}

export async function selectLikedPosts(
  client: Client,
  params: { userId: number; ltId?: number },
): Promise<Array<Post>> {
  const builder = new QueryBuilder()
    .append(SELECT_POST)
    .append`WHERE p.draft = false AND p.id IN (SELECT post_id FROM likes WHERE user_id = ${params.userId}`;
  if (params.ltId) {
    builder.append`AND post_id < ${params.ltId} `;
  }
  builder.append(
    `ORDER BY post_id DESC) ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
  );
  const result = await client.queryObject<Post>(
    builder.query,
    builder.args,
  );
  return result.rows;
}

export async function selectPostsBySearchWord(
  client: Client,
  params: {
    searchWord: string;
    postId?: number;
    loginUserId?: number;
  },
): Promise<Array<Post>> {
  const searchWord = params.searchWord.trim();
  if (searchWord.trim().length === 0) {
    return [];
  }
  const builder = new QueryBuilder()
    .append(SELECT_POST)
    .append`WHERE p.source &@~ ${searchWord.trim()} AND (p.draft = false`;
  if (params.loginUserId) {
    builder.append`OR p.user_id = ${params.loginUserId}`;
  }
  builder.append(")");
  if (params.postId) {
    builder.append`AND p.id < ${params.postId}`;
  }
  builder.append(`ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`);
  const result = await client.queryObject<Post>(
    builder.query,
    builder.args,
  );
  return result.rows;
}

export async function insertComment(
  client: Client,
  params: { postId: number; userId: number; source: string },
): Promise<void> {
  await supabase.from("comment").insert({
    "post_id": params.postId,
    "user_id": params.userId,
    "source": params.source,
  });

  try {
    // TODO async for performance
    const results = await client.queryObject<
      { user_id: number; post_id: number }
    >`
      INSERT INTO notification (user_id, type, post_id, action_user_id)
      SELECT user_id, 'comment'::notification_type, id, ${params.userId}::integer FROM post
      WHERE id=${params.postId} AND user_id != ${params.userId}
      UNION
      SELECT DISTINCT user_id, 'comment'::notification_type, post_id, ${params.userId}::integer FROM comment
      WHERE post_id=${params.postId} AND user_id != ${params.userId}
      RETURNING user_id, post_id
  `;

    const userIds = results.rows.map((row) => row.user_id);
    await supabase.from("app_user").update({ notification: true }).in(
      "id",
      userIds,
    );
  } catch (error) {
    console.error(error);
  }
}

export async function selectComments(
  postId: number,
) {
  const { data } = await supabase.from("comment").select(
    "id,user_id,source,updated_at,app_user(name,picture)",
  ).eq("post_id", postId).order("id").limit(100);
  return data!;
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

  return data!;
}

export async function insertLike(
  client: Client,
  params: { userId: number; postId: number },
) {
  await supabase.from("likes").insert({
    "user_id": params.userId,
    "post_id": params.postId,
  });

  try {
    // TODO async for performance
    const results = await client.queryObject<
      { user_id: number; post_id: number }
    >`
        INSERT INTO notification (user_id, type, post_id, action_user_id)
        SELECT user_id, 'like', ${params.postId}, ${params.userId} FROM post
        WHERE id=${params.postId} AND user_id != ${params.userId}
        RETURNING user_id, post_id
      `;

    for (const row of results.rows) {
      await supabase.from("app_user").update({ notification: true }).eq(
        "id",
        row.user_id,
      );
    }
  } catch (error) {
    console.error(error);
  }
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
  client: Client,
  { userId, postIds }: { userId: number; postIds: number[] },
): Promise<number[]> {
  const result = await client.queryObject<{ post_id: number }>`
      SELECT post_id
      FROM likes p
      WHERE user_id = ${userId}
      AND post_id = ANY(${postIds}::int[])
    `;

  return result.rows.map((row) => row.post_id);
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
