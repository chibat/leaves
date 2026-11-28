import type { Props } from "./following.server.ts";
import FollowingPosts from "~/islands/FollowingPosts.tsx";

export default function Following({ loginUserId, posts }: Props) {
  return (
    <>
      <title>Following - Leaves</title>
      <main className="container">
        <FollowingPosts loginUserId={loginUserId} initialPosts={posts} />
      </main>
    </>
  );
}
