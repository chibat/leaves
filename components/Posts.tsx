import * as hljs from "highlightjs";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";

import type { ResponsePost } from "~/common/types.ts";
import { useEffect, useState } from "preact/hooks";
import { AppUser } from "~/server/db.ts";
import { Signal } from "@preact/signals-core";
import { trpc } from "~/client/trpc.ts";
import Mousetrap from "mousetrap";
import { useSignal } from "@preact/signals";

type Props = {
  posts: Signal<ResponsePost[]>;
  user?: AppUser;
};

export default function Posts(props: Props) {
  const user = props.user;
  const posts = props.posts.value;

  const [modal, setModal] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>();
  const selectedIndex = useSignal<number>(0);
  const [now] = useState<Date>(new Date());

  useEffect(() => {
    registerJumpElements(document.getElementsByClassName("postCard"));
    Mousetrap.bind("o", () => {
      location.href = `/posts/${props.posts.value[selectedIndex.value].id}`;
    });
    Mousetrap.bind("e", () => {
      const post = props.posts.value[selectedIndex.value];
      if (user?.id === post.user_id) {
        location.href = `/posts/${post.id}/edit`;
      }
    });
  }, []);

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  async function deletePost(postId: number) {
    if (confirm("Delete the post?")) {
      await trpc.deletePost.mutate({ postId });
      location.reload();
    }
  }

  async function like(post: ResponsePost) {
    if (!props.user) {
      location.href = "/auth";
      return;
    }
    await trpc.createLike.mutate({ postId: post.id });
    post.liked = true;
    post.likes = "" + (Number(post.likes) + 1);
    props.posts.value = [...props.posts.value];
  }

  async function cancelLike(post: ResponsePost) {
    await trpc.cancelLike.mutate({ postId: post.id });
    post.liked = false;
    post.likes = "" + (Number(post.likes) - 1);
    props.posts.value = [...props.posts.value];
  }

  function openModal(postId: number) {
    setSelectedPostId(postId);
    setModal(true);
  }

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
      {posts && posts.map((post) => {
        return {
          ...post,
          createdDate: new Date(post.created_at),
          updatedDate: new Date(post.updated_at),
        };
      })
        .map((post) => (
          <div class="card mb-3 postCard" key={post.id}>
            <div class="card-header bg-transparent d-flex justify-content-between">
              <div>
                <img
                  src={post.picture}
                  alt="mdo"
                  width="32"
                  height="32"
                  class="rounded-circle"
                  referrerpolicy="no-referrer"
                />
                <a href={`/users/${post.user_id}`} class="ms-2 noDecoration">
                  {post.name}
                </a>
              </div>
              <div>
                <a
                  href={`/posts/${post.id}`}
                  class="ms-2 noDecoration"
                  title={`Created at: ${post.createdDate.toLocaleString()} , Updated at: ${post.updatedDate.toLocaleString()}`}
                >
                  {formatDate(now, post.updatedDate)}
                </a>
              </div>
            </div>
            <div class="card-body">
              {post.draft &&
                (
                  <div
                    class="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <span
                      class="badge bg-danger"
                      style={{ marginRight: "5px" }}
                    >
                      DRAFT
                    </span>
                    <div>This post is visible only to you.</div>
                  </div>
                )}
              <span
                class="post"
                dangerouslySetInnerHTML={{
                  __html: post.source,
                }}
              >
              </span>
              <div class="d-flex justify-content-between">
                <div>
                  <a
                    class="btn btn-outline-secondary btn-sm"
                    href={user ? `/posts/${post.id}` : "/auth"}
                  >
                    Comment
                  </a>
                  {Number(post.comments) > 0 &&
                    (
                      <a class="ms-2 noDecoration" href={`/posts/${post.id}`}>
                        {post.comments}{" "}
                        Comment{post.comments === "1" ? "" : "s"}
                      </a>
                    )}
                  {user && post.liked &&
                    (
                      <a
                        href={void (0)}
                        onClick={() => cancelLike(post)}
                        class="ms-3"
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src="/assets/img/heart-fill.svg"
                          alt="Edit"
                          width="20"
                          height="20"
                        >
                        </img>
                      </a>
                    )}
                  {!post.liked &&
                    (
                      <a
                        href={void (0)}
                        onClick={() => like(post)}
                        class="ms-3"
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src="/assets/img/heart.svg"
                          alt="Edit"
                          width="20"
                          height="20"
                        >
                        </img>
                      </a>
                    )}
                  {Number(post.likes) > 0 &&
                    (
                      <a
                        href={void (0)}
                        class="noDecoration ms-2"
                        onClick={() => openModal(post.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.likes} Like{post.likes === "1" ? "" : "s"}
                      </a>
                    )}
                </div>
                {user && user.id === post.user_id &&
                  (
                    <div>
                      <a
                        href={void (0)}
                        class="me-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => deletePost(post.id)}
                      >
                        <img
                          src="/assets/img/trash-fill.svg"
                          alt="Delete"
                          width="20"
                          height="20"
                        >
                        </img>
                      </a>
                      <a href={`/posts/${post.id}/edit`}>
                        <img
                          src="/assets/img/pencil-fill.svg"
                          alt="Edit"
                          width="20"
                          height="20"
                        >
                        </img>
                      </a>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      {modal && selectedPostId &&
        <LikeUsersModal postId={selectedPostId} setModal={setModal} />}
    </>
  );
}

function formatDate(now: Date, date: Date) {
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
}
