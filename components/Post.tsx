import { trpc } from "~/client/trpc.ts";
import { useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";
import { GetPostsOutput } from "~/server/trpc/procedures/getPosts.ts";

export default function Post(props: { post: GetPostsOutput; userId?: number }) {
  const post = useSignal(props.post);
  const now = new Date();
  const createdDate = new Date(post.value.created_at);
  const updatedDate = new Date(post.value.updated_at);

  const [modal, setModal] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>();

  async function deletePost(postId: number) {
    if (confirm("Delete the post?")) {
      await trpc.deletePost.mutate({ postId });
      location.reload();
    }
  }

  async function like() {
    if (!props.userId) {
      location.href = "/auth";
      return;
    }
    await trpc.createLike.mutate({ postId: post.value.id });
    post.value = { ...post.value, liked: true, likes: post.value.likes + 1 };
  }

  async function cancelLike() {
    await trpc.cancelLike.mutate({ postId: post.value.id });
    post.value = { ...post.value, liked: false, likes: post.value.likes - 1 };
  }

  function openModal(postId: number) {
    setSelectedPostId(postId);
    setModal(true);
  }

  return (
    <>
      <div class="card mb-3 postCard" key={post.value.id}>
        <div class="card-header bg-transparent d-flex justify-content-between">
          <div>
            <img
              src={post.value.picture!}
              alt="mdo"
              width="32"
              height="32"
              class="rounded-circle"
              referrerpolicy="no-referrer"
            />
            <a
              href={`/users/${post.value.account ?? post.value.user_id}`}
              class="ms-2 noDecoration"
            >
              {post.value.name}
            </a>
          </div>
          <div>
            <a
              href={`/posts/${post.value.id}`}
              class="ms-2 noDecoration"
              title={`Created at: ${createdDate.toLocaleString()} , Updated at: ${updatedDate.toLocaleString()}`}
            >
              {formatDate(now, updatedDate)}
            </a>
          </div>
        </div>
        <div class="card-body">
          {post.value.draft &&
            (
              <span class="badge bg-danger mb-2">
                🔒 PRIVATE
              </span>
            )}
          <span
            class="post"
            dangerouslySetInnerHTML={{
              __html: post.value.source,
            }}
          >
          </span>
          <div class="d-flex justify-content-between">
            <div>
              <a
                class="btn btn-outline-secondary btn-sm"
                href={props.userId
                  ? `/posts/${post.value.id}#comment`
                  : "/auth"}
              >
                Comment
              </a>
              {BigInt(post.value.comments) > 0 &&
                (
                  <a class="ms-2 noDecoration" href={`/posts/${post.value.id}`}>
                    {post.value.comments}{" "}
                    Comment{post.value.comments === 1 ? "" : "s"}
                  </a>
                )}
              {props.userId && post.value.liked &&
                (
                  <img
                    src="/assets/img/heart-fill.svg"
                    alt="Edit"
                    width="20"
                    height="20"
                    onClick={() => cancelLike()}
                    class="ms-3"
                    style={{ cursor: "pointer" }}
                  />
                )}
              {!post.value.liked &&
                (
                  <img
                    src="/assets/img/heart.svg"
                    alt="Edit"
                    width="20"
                    height="20"
                    onClick={() => like()}
                    class="ms-3"
                    style={{ cursor: "pointer" }}
                  />
                )}
              {BigInt(post.value.likes) > 0n &&
                (
                  <span
                    class="noDecoration ms-2"
                    onClick={() => openModal(post.value.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {post.value.likes} Like{post.value.likes === 1 ? "" : "s"}
                  </span>
                )}
            </div>
            {props.userId === post.value.user_id &&
              (
                <div>
                  <a
                    href={void (0)}
                    class="me-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => deletePost(post.value.id)}
                  >
                    <img
                      src="/assets/img/trash-fill.svg"
                      alt="Delete"
                      width="20"
                      height="20"
                    >
                    </img>
                  </a>
                  <a href={`/posts/${post.value.id}/edit`}>
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
      {modal && selectedPostId && (
        <LikeUsersModal postId={selectedPostId} setModal={setModal} />
      )}
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
