import type { Props } from "./edit.server.ts";
import PostEdit from "~/islands/PostEdit.tsx";

export default function EditPost({ post }: Props) {
  return (
    <>
      <title>{post ? "Edit - Leaves" : "Not Found - Leaves"}</title>
      <main className="container">
        {post
          ? (
            <>
              <h1>Edit Post</h1>
              <PostEdit post={post} />
            </>
          )
          : <h1>404 Not Found</h1>}
      </main>
    </>
  );
}
