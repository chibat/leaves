import * as hljs from "highlightjs";

import { useEffect } from "preact/hooks";
import { Signal } from "@preact/signals-core";
import Mousetrap from "mousetrap";
import { useSignal } from "@preact/signals";
import Post from "~/components/Post.tsx";
import { GetPostsOutput } from "~/server/trpc/procedures/getPosts.ts";

type Props = {
  posts: Signal<GetPostsOutput[]>;
  userId?: number;
};

export default function Posts(props: Props) {
  const selectedIndex = useSignal<number>(0);

  useEffect(() => {
    registerJumpElements(document.getElementsByClassName("postCard"));
    Mousetrap.bind("o", () => {
      location.href = `/posts/${props.posts.value[selectedIndex.value].id}`;
    });
    Mousetrap.bind("e", () => {
      const post = props.posts.value[selectedIndex.value];
      if (props.userId === post.user_id) {
        location.href = `/posts/${post.id}/edit`;
      }
    });
  }, []);

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  function registerJumpElements(elements: HTMLCollectionOf<Element>) {
    const KEYCODE_J = "j";
    const KEYCODE_K = "k";

    let currentIndex = -1;

    const scollElement = (event: KeyboardEvent) => {
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
      selectedIndex.value = currentIndex;
    };

    if (document.addEventListener) {
      document.addEventListener(
        "keydown",
        scollElement,
        false,
      );
    }
  }

  return (
    <>
      {props.posts.value && props.posts.value.map((post) =>
        <Post post={post} userId={props.userId} />
      )}
    </>
  );
}

