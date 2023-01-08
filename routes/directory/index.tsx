import { Handlers, PageProps } from "$fresh/server.ts";
import { pool, selectPostIds, selectUsers } from "~/lib/db.ts";

type PageType = {
  userIds: number[]
}

export const handler: Handlers<PageType> = {
  async GET(_req, ctx) {
    const userIds = await pool((client) => selectUsers(client));
    const res = await ctx.render({ userIds });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <main class="container">
      <h6>Users</h6>
      {
        props.data.userIds.map(userId => <><a href={`/directory/${userId}`}>{userId}</a><br /></>)
      }
    </main>
  );
}
