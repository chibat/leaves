const kv = await Deno.openKv("session");

type SessionKey = ["session", /* sessionId */ string?];

type SessionValue = {
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSession(
  sessionId: string,
): Promise<SessionValue | null> {
  const entry = await kv.get<SessionValue>(
    ["session", sessionId] satisfies SessionKey,
  );
  kv.set(entry.key, { ...entry.value, updatedAt: new Date() }); // async
  return entry.value;
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID();
  await kv.set(
    ["session", sessionId] satisfies SessionKey,
    {
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies SessionValue,
  );
  return sessionId;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await kv.delete(["session", sessionId] satisfies SessionKey);
  console.log("deleteSession", sessionId);
  deleteExpiredSession();
}

/**
 * 作成後、1ヶ月経過しているセッションを削除する
 * TODO セッション取得時に updated_at を更新するか？
 *
 * @param client
 * @param userId
 */
async function deleteExpiredSession(): Promise<void> {
  const now = new Date().getTime();
  for await (
    const entry of kv.list<SessionValue>({
      prefix: ["session"] satisfies SessionKey,
    })
  ) {
    if (now - entry.value.updatedAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
      console.log("deleteExpiredSession", entry);
      await kv.delete(entry.key);
    }
  }
}

export async function showAll(table?: string) {
  const prefix = table ? [table] : [];
  for await (
    const entry of kv.list({ prefix })
  ) {
    console.log(entry);
  }
}

export async function deleteAll(table?: string) {
  const prefix = table ? [table] : [];
  for await (
    const entry of kv.list({ prefix })
  ) {
    await kv.delete(entry.key);
  }
}

if (import.meta.main) {
  await showAll();
  //await deleteAll();
}
