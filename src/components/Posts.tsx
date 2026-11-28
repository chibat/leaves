import hljs from "highlight.js";
import { useEffect, useRef } from "react";
import Mousetrap from "mousetrap";
import { useRouter } from "@void/react";
import Post from "~/components/Post.tsx";
import type { GetPostsOutput } from "~/common/types.ts";

type Props = {
  posts: GetPostsOutput[];
  userId?: number;
  onPostDeleted: (postId: number) => void;
};

export default function Posts(props: Props) {
  const selectedIndex = useRef(0);
  const postsRef = useRef(props.posts);
  postsRef.current = props.posts;
  const router = useRouter();

  useEffect(() => {
    const removeJumpListener = registerJumpElements(
      document.getElementsByClassName("postCard"),
    );
    Mousetrap.bind("o", () => {
      const post = postsRef.current[selectedIndex.current];
      if (post) void router.visit(`/posts/${post.id}`);
    });
    Mousetrap.bind("e", () => {
      const post = postsRef.current[selectedIndex.current];
      if (!post) return;
      if (props.userId === post.user_id) {
        void router.visit(`/posts/${post.id}/edit`);
      }
    });
    return () => {
      removeJumpListener();
      Mousetrap.unbind("o");
      Mousetrap.unbind("e");
    };
  }, []);

  useEffect(() => {
    hljs.highlightAll();
  });

  function registerJumpElements(
    elements: HTMLCollectionOf<Element>,
  ): () => void {
    const KEYCODE_J = "j";
    const KEYCODE_K = "k";

    let currentIndex = -1;

    const scollElement = (event: KeyboardEvent) => {
      if (elements.length === 0) return;
      if (event.key == ".") {
        currentIndex = -1;
      } else if (event.key != KEYCODE_J && event.key != KEYCODE_K) {
        return;
      }
      // 次の位置を計算
      let nextIndex = currentIndex + ((event.key == KEYCODE_J) ? 1 : -1);

      if (nextIndex < 0) {
        nextIndex = 0;
      } else if (nextIndex >= elements.length) {
        nextIndex = elements.length - 1;
      }

      // 要素が表示されるようにスクロール
      elements[nextIndex].scrollIntoView();
      currentIndex = nextIndex;
      selectedIndex.current = currentIndex;
    };

    if (document.addEventListener) {
      document.addEventListener(
        "keydown",
        scollElement,
        false,
      );
    }
    return () => document.removeEventListener("keydown", scollElement, false);
  }

  return (
    <>
      {props.posts.map((post) =>
        <Post
          key={post.id}
          post={post}
          userId={props.userId}
          onPostDeleted={props.onPostDeleted}
        />
      )}
    </>
  );
}
