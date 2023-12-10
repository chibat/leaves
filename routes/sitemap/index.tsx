import { defineRoute } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { selectUsers } from "~/server/db.ts";

export default defineRoute(async (_req, _ctx) => {
  const users = await selectUsers();

  return (
    <>
      <Head>
        <title>Sitemap Users - Leaves</title>
      </Head>
      <main class="container" style={{ wordBreak: "break-word" }}>
        <h1>Sitemap Users</h1>
        {users.map((user) => (
          <>
            <a href={`/sitemap/${user.user_id}`}>{user.user_id}</a>&nbsp;
          </>
        ))}
      </main>
    </>
  );
});
