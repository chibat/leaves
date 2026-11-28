import { api } from "~/client/api.ts";
import { useState } from "react";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";
import type { GetPostsOutput } from "~/common/types.ts";
import {
  formatHydrationSafeDate,
  formatHydrationSafeDateTime,
} from "~/common/date_format.ts";
import { Link, useRouter } from "@void/react";
import { useEffect } from "react";

export default function Post(props: {
  post: GetPostsOutput;
  userId?: number;
  onPostDeleted: (postId: number) => void;
}) {
  const router = useRouter();
  const [post, setPost] = useState(props.post);
  const createdDate = new Date(post.created_at);
  const updatedDate = new Date(post.updated_at);
  const [dateDisplay, setDateDisplay] = useState(() => ({
    title:
      `Created at: ${formatHydrationSafeDateTime(createdDate)} , Updated at: ${formatHydrationSafeDateTime(updatedDate)}`,
    text: formatHydrationSafeDate(updatedDate),
  }));

  const [modal, setModal] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>();

  useEffect(() => {
    setDateDisplay({
      title:
        `Created at: ${createdDate.toLocaleString()} , Updated at: ${updatedDate.toLocaleString()}`,
      text: formatDate(new Date(), updatedDate),
    });
  }, [post.created_at, post.updated_at]);

  async function deletePost(postId: number) {
    if (confirm("Delete the post?")) {
      await api.deletePost({ postId });
      props.onPostDeleted(postId);
      await router.refresh({ preserveState: false });
    }
  }

  async function like() {
    if (!props.userId) {
      location.href = "/auth";
      return;
    }
    await api.createLike({ postId: post.id });
    setPost((current) => ({ ...current, liked: true, likes: current.likes + 1 }));
  }

  async function cancelLike() {
    await api.cancelLike({ postId: post.id });
    setPost((current) => ({ ...current, liked: false, likes: current.likes - 1 }));
  }

  function openModal(postId: number) {
    setSelectedPostId(postId);
    setModal(true);
  }

  return (
    <>
      <div className="card mb-3 postCard" key={post.id}>
        <div className="card-header bg-transparent d-flex justify-content-between">
          <div>
            <img
              src={post.picture!}
              alt="mdo"
              width="32"
              height="32"
              className="rounded-circle"
              referrerPolicy="no-referrer"
            />
            <Link
              href={`/users/${post.account ?? post.user_id}`}
              className="ms-2 noDecoration"
            >
              {post.name}
            </Link>
          </div>
          <div>
            <Link
              href={`/posts/${post.id}`}
              className="ms-2 noDecoration"
              title={dateDisplay.title}
            >
              {dateDisplay.text}
            </Link>
          </div>
        </div>
        <div className="card-body">
          {post.draft &&
            (
              <span className="badge bg-danger mb-2">
                🔒 PRIVATE
              </span>
            )}
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: post.source,
            }}
          >
          </div>
          <div className="d-flex justify-content-between">
            <div>
              {props.userId
                ? (
                  <Link
                    className="btn btn-outline-secondary btn-sm"
                    href={`/posts/${post.id}#comment`}
                  >
                    Comment
                  </Link>
                )
                : (
                  <a className="btn btn-outline-secondary btn-sm" href="/auth">
                    Comment
                  </a>
                )}
              {BigInt(post.comments) > 0 &&
                (
                  <Link className="ms-2 noDecoration" href={`/posts/${post.id}`}>
                    {post.comments}{" "}
                    Comment{post.comments === 1 ? "" : "s"}
                  </Link>
                )}
              {props.userId && post.liked &&
                (
                  <img
                    src="/assets/img/heart-fill.svg"
                    alt="Edit"
                    width="20"
                    height="20"
                    onClick={() => cancelLike()}
                    className="ms-3"
                    style={{ cursor: "pointer" }}
                  />
                )}
              {!post.liked &&
                (
                  <img
                    src="/assets/img/heart.svg"
                    alt="Edit"
                    width="20"
                    height="20"
                    onClick={() => like()}
                    className="ms-3"
                    style={{ cursor: "pointer" }}
                  />
                )}
              {BigInt(post.likes) > 0n &&
                (
                  <span
                    className="noDecoration ms-2"
                    onClick={() => openModal(post.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {post.likes} Like{post.likes === 1 ? "" : "s"}
                  </span>
                )}
            </div>
            {props.userId === post.user_id &&
              (
                <div>
                  <a
                    href={void (0)}
                    className="me-2"
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
                  <Link href={`/posts/${post.id}/edit`}>
                    <img
                      src="/assets/img/pencil-fill.svg"
                      alt="Edit"
                      width="20"
                      height="20"
                    >
                    </img>
                  </Link>
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
