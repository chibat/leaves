import { Pool, PoolClient, Transaction } from "postgres/mod.ts";
import { PAGE_ROWS } from "~/lib/constants.ts";
import { SessionType } from "~/lib/auth.ts";

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

const connectionPool = new Pool(
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

export async function pool<T>(
  handler: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await connectionPool.connect();
  try {
    return handler(client);
  } catch (error) {
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

export async function insertPost(
  client: Client,
  params: { userId: number; source: string },
): Promise<number> {
  const result = await client.queryObject<{ id: number }>`
      INSERT INTO post (user_id, source)
      VALUES (${params.userId}, ${params.source})
      RETURNING id
    `;
  return result.rows[0].id;
}

export async function updatePost(
  client: Client,
  params: { postId: number; userId: number; source: string },
) {
  await client.queryObject`
      UPDATE post SET source= ${params.source}, updated_at=CURRENT_TIMESTAMP
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

export async function selectPosts(client: Client): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `${SELECT_POST} ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
  );
  return result.rows;
}

export async function selectPostByLtId(
  client: Client,
  ltId: number,
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.id < $1
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
    [ltId],
  );
  return result.rows;
}

export async function selectUserPosts(
  client: Client,
  userId: number,
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id = $1
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
    [userId],
  );
  return result.rows;
}

export async function selectUserPostByLtId(
  client: Client,
  params: { ltId: number; userId: number },
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id = $1
      AND p.id < $2
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    [params.userId, params.ltId],
  );
  return result.rows;
}

export async function selectFollowingUsersPosts(
  client: Client,
  userId: number,
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = $1)
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
    [userId],
  );
  return result.rows;
}

export async function selectFollowingUsersPostByLtId(
  client: Client,
  params: { ltId: number; userId: number },
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = $1)
      AND p.id < $2
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    [params.userId, params.ltId],
  );
  return result.rows;
}

export async function selectLikedPosts(
  client: Client,
  userId: number,
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.id IN (SELECT post_id FROM likes WHERE user_id = $1 ORDER BY post_id DESC)
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
    [userId],
  );
  return result.rows;
}

export async function selectLikedPostsByLtId(
  client: Client,
  params: { ltId: number; userId: number },
): Promise<Array<Post>> {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.id IN (SELECT post_id FROM likes WHERE user_id = $1 AND post_id < $2 ORDER BY post_id DESC)
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    [params.userId, params.ltId],
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
  const result = await client.queryObject<AppUser>`
  SELECT * FROM app_user u WHERE EXISTS (SELECT 1 FROM app_session WHERE user_id = u.id AND id = ${sessionId})
`;
  return result.rowCount ? result.rows[0] : undefined;
}

export async function insertSession(
  client: Client,
  userId: number,
): Promise<string> {
  const result = await client.queryObject<{ id: string }>`
      INSERT INTO app_session (user_id)
      VALUES (${userId})
      RETURNING id
    `;
  const sessionId = result.rows[0].id;
  await deleteExpiredSession(client, userId);
  return sessionId;
}

export async function deleteSession(
  client: Client,
  session: SessionType,
): Promise<void> {
  await client.queryObject<void>`
  DELETE FROM app_session WHERE id = ${session.id}
`;
  await deleteExpiredSession(client, session.user.id);
}

/**
 * 作成後、1ヶ月経過しているセッションを削除する
 * TODO セッション取得時に updated_at を更新するか？
 *
 * @param client
 * @param userId
 */
export async function deleteExpiredSession(
  client: Client,
  userId: number,
): Promise<void> {
  try {
    await client.queryObject<void>`
  DELETE FROM app_session WHERE user_id = ${userId} AND updated_at < NOW() - CAST('1 months' AS INTERVAL)
`;
  } catch (ignore) {
    console.error(ignore);
  }
}
