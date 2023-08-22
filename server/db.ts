import { Pool, PoolClient, Transaction } from "postgres/mod.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import { getSession } from "~/server/kv.ts";
import * as uuid from "$std/uuid/mod.ts";
import { QueryBuilder } from "./query_builder.ts";

export type Client = PoolClient | Transaction;

export type AppUser = {
  id: number;
  google_id?: string;
  name: string;
  picture?: string;
  notification: boolean;
  updated_at?: string;
  created_at?: string;
};

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

export async function selectUserByGoogleId(
  client: Client,
  googleId: string,
) {
  const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE google_id=${googleId}`;
  return result.rowCount ? result.rows[0] : null;
}

export async function updateUser(
  client: Client,
  params: { id: number; name: string; picture: string },
) {
  await client.queryObject<{ id: number }>`
      UPDATE app_user
      SET name=${params.name}, picture=${params.picture}, updated_at=CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `;
  return;
}

export async function upsertUser(
  client: Client,
  params: { googleId: string; name: string; picture: string },
) {
  const result = await client.queryObject<AppUser>`
  INSERT INTO app_user (google_id, name, picture)
  VALUES (${params.googleId}, ${params.name}, ${params.picture})
  ON CONFLICT(google_id)
  DO UPDATE SET google_id=${params.googleId}, name=${params.name}, picture=${params.picture}, updated_at=CURRENT_TIMESTAMP
  RETURNING *
`;
  return result.rows[0];
}

export async function selectUser(
  client: Client,
  userId: number,
): Promise<AppUser | null> {
  const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE id = ${userId}
    `;
  return result.rowCount ? result.rows[0] : null;
}

export async function selectUsers(
  client: Client,
): Promise<Post[]> {
  const result = await client.queryObject<Post>`
  SELECT user_id, max(updated_at) as updated_at FROM post GROUP BY user_id ORDER BY user_id
    `;
  return result.rows;
}

export async function insertPost(
  client: Client,
  params: { userId: number; source: string; draft: boolean },
): Promise<number> {
  const result = await client.queryObject<{ id: number }>`
      INSERT INTO post (user_id, source, draft)
      VALUES (${params.userId}, ${params.source}, ${params.draft})
      RETURNING id
    `;
  return result.rows[0].id;
}

export async function updatePost(
  client: Client,
  params: { postId: number; userId: number; source: string; draft: boolean },
) {
  await client.queryObject`
      UPDATE post
      SET source= ${params.source}, draft= ${params.draft}, updated_at=CURRENT_TIMESTAMP
      WHERE id = ${params.postId} and user_id = ${params.userId}
      RETURNING id
    `;
}

export async function deletePost(
  client: Client,
  params: { id: number; userId: number },
) {
  await client.queryObject`
      DELETE FROM post where id = ${params.id} and user_id = ${params.userId}
    `;
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

export async function selectPostIds(
  client: Client,
): Promise<Array<Post>> {
  const result = await client.queryObject<
    Post
  >`SELECT id,updated_at FROM post WHERE draft = false ORDER BY id DESC LIMIT 1000`;
  return result.rows;
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
  await client.queryObject<{ id: number }>`
      INSERT INTO comment (post_id, user_id, source)
      VALUES (${params.postId}, ${params.userId}, ${params.source})
      RETURNING id
    `;

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

    for (const row of results.rows) {
      client.queryObject`
        UPDATE app_user
        SET notification = true
        WHERE id = ${row.user_id}
  `;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function selectComments(
  client: Client,
  postId: number,
): Promise<Array<Comment>> {
  const result = await client.queryObject<Comment>`
      SELECT
        c.*,
        u.name, u.picture
      FROM comment c
      LEFT JOIN app_user u ON (c.user_id = u.id)
      where c.post_id = ${postId}
      ORDER BY c.id LIMIT 100`;
  return result.rows;
}

export async function deleteComment(
  client: Client,
  params: { id: number; userId: number },
): Promise<void> {
  await client.queryObject`
      DELETE FROM comment where id = ${params.id} and user_id = ${params.userId}
    `;
}

export async function insertFollow(
  client: Client,
  params: { userId: number; followingUserId: number },
): Promise<void> {
  await client.queryObject<void>`
      INSERT INTO follow (user_id, following_user_id)
      VALUES (${params.userId}, ${params.followingUserId})
    `;

  try {
    // TODO async for performance
    await client.queryObject<void>`
      INSERT INTO notification (user_id, type, action_user_id)
      VALUES (${params.followingUserId}, 'follow', ${params.userId})
    `;

    await client.queryObject`
      UPDATE app_user
      SET notification = true
      WHERE id = ${params.followingUserId}
    `;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteFollow(
  client: Client,
  params: { userId: number; followingUserId: number },
): Promise<void> {
  await client.queryObject<void>`
      DELETE FROM follow
      WHERE user_id = ${params.userId} and following_user_id = ${params.followingUserId}
    `;
}

export async function selectFollowingUsers(
  client: Client,
  userId: number,
): Promise<Array<AppUser>> {
  const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT following_user_id FROM follow WHERE user_id = ${userId} ORDER BY created_at DESC)
    `;
  return result.rows;
}

export async function selectFollowerUsers(
  client: Client,
  followingUserId: number,
): Promise<Array<AppUser>> {
  const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM follow WHERE following_user_id = ${followingUserId} ORDER BY created_at DESC)
    `;
  return result.rows;
}

export async function selectCountFollowing(
  client: Client,
  userId: number,
): Promise<string> {
  const result = await client.queryObject<{ cnt: string }>`
      SELECT count(*) || '' as cnt
      FROM app_user
      WHERE id
      IN (SELECT following_user_id FROM follow WHERE user_id = ${userId} ORDER BY created_at DESC)
    `;
  return result.rows[0].cnt;
}

export async function selectCountFollower(
  client: Client,
  followingUserId: number,
): Promise<string> {
  const result = await client.queryObject<{ cnt: string }>`
      SELECT count(*) || '' as cnt
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM follow WHERE following_user_id = ${followingUserId} ORDER BY created_at DESC)
    `;
  return result.rows[0].cnt;
}

export async function judgeFollowing(
  client: Client,
  params: { userId: number; followingUserId: number },
): Promise<boolean> {
  const result = await client.queryObject<{ cnt: string }>`
      SELECT 1 FROM follow WHERE user_id = ${params.userId} AND following_user_id = ${params.followingUserId}
    `;
  return result.rows.length === 1;
}

export async function selectNotificationsWithUpdate(
  client: Client,
  userId: number,
): Promise<Array<AppNotification>> {
  const result = await client.queryObject<AppNotification>`
      SELECT n.*, u.name
      FROM notification n
      LEFT OUTER JOIN app_user U on (n.action_user_id = u.id)
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

  try {
    // TODO async for performance
    await client.queryObject`
        UPDATE app_user
        SET notification = false
        WHERE id = ${userId}
      `;
  } catch (error) {
    console.error(error);
  }

  return result.rows;
}

export async function insertLike(
  client: Client,
  params: { userId: number; postId: number },
): Promise<void> {
  await client.queryObject<void>`
      INSERT INTO likes (user_id, post_id)
      VALUES (${params.userId}, ${params.postId})
    `;

  try {
    // TODO async for performance
    const results = await client.queryObject<
      { user_id: number; post_id: number }
    >`
        INSERT INTO notification (user_id, type, post_id, action_user_id)
        SELECT user_id, 'like', id, ${params.userId} FROM post
        WHERE id=${params.postId} AND user_id != ${params.userId}
        RETURNING user_id, post_id
      `;

    for (const row of results.rows) {
      await client.queryObject`
          UPDATE app_user
          SET notification = true
          WHERE id = ${row.user_id}
        `;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function deleteLike(
  client: Client,
  params: { userId: number; postId: number },
): Promise<void> {
  await client.queryObject<void>`
      DELETE FROM likes
      WHERE user_id = ${params.userId} AND post_id = ${params.postId}
    `;
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

export async function selectLikeUsers(
  client: Client,
  postId: number,
): Promise<Array<AppUser>> {
  const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM likes WHERE post_id = ${postId} ORDER BY created_at DESC)
    `;
  return result.rows;
}

export async function selectSession(
  client: Client,
  sessionId: string,
): Promise<AppUser | undefined> {
  if (!uuid.validate(sessionId)) {
    return undefined;
  }
  const session = await getSession(sessionId);
  if (!session) {
    return undefined;
  }
  const result = await client.queryObject<AppUser>`
  SELECT * FROM app_user u WHERE id = ${session.userId}
`;
  return result.rowCount ? result.rows[0] : undefined;
}
