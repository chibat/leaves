import { Handlers, PageProps } from "$fresh/server.ts";
import { pool, selectPostIds } from "~/lib/db.ts";

type PageType = {
  postIds: number[]
}

export const handler: Handlers<PageType> = {
  async GET(_req, ctx) {
    const userId = Number(ctx.params.userId);
    console.log(userId);
    const postIds = await pool((client) => selectPostIds(client, userId));
    const res = await ctx.render({ postIds });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  const userId = Number(props.params.userId);
  console.log(userId);
  return (
    <main className="container">
      <h6>Posts</h6>
      {
        props.data.postIds.map(postId => <><a href={`/posts/${postId}`}>{postId}</a>&nbsp;</>)
      }
    </main>
  );
}
