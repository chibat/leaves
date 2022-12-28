import {
  Pool,
  PoolClient,
  Transaction,
} from "https://deno.land/x/postgres@v0.17.0/mod.ts";

export type Client = PoolClient | Transaction;

export type AppUser = {
  id: number;
  google_id?: string;
  name?: string;
  picture?: string;
  notification: boolean;
  updated_at?: string;
  created_at?: string;
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
  3,
  true,
);

export async function pool<T>(
  handler: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await connectionPool.connect();
  try {
    return handler(client);
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  handler: (client: Client) => Promise<T>,
): Promise<T> {
  const client = await connectionPool.connect();
  const transaction = client.createTransaction("T2");
  try {
    await transaction.begin();
    const result = await handler(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
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
