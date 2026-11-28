import type { Props } from "./likes.server.ts";
import LikePosts from "~/islands/LikePosts.tsx";

export default function Likes({ loginUserId, posts }: Props) {
  return (
    <>
      <title>Likes - Leaves</title>
      <main className="container">
        <LikePosts loginUserId={loginUserId} initialPosts={posts} />
      </main>
    </>
  );
}
