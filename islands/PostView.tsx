import { useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import Mousetrap from "mousetrap";
import { PostViewType } from "~/server/db.ts";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";
import { render } from "~/server/markdown.ts";
import { trpc } from "~/client/trpc.ts";
import { createRef } from "preact";

type Comments = ReturnType<typeof trpc.getComments.query> extends
  Promise<infer T> ? T : never;

export default function PostView(
  props: { post: PostViewType; postTitle: string; userId?: number },
) {
  const userId = props.userId;
  const post = props.post;

  const preview = useSignal(false);
  const text = useSignal("");
  const sanitizedCommentHtml = useSignal("");
  const postSource = render(props.post.source!, {});
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>();
  const [comments, setComments] = useState<Comments>();
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(true);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const message = useSignal("");
  const textarea = createRef();

  function displayEdit() {
    preview.value = false;
  }

  async function displayPreview() {
    sanitizedCommentHtml.value = await trpc.md2html.query({
      source: text.value,
    });
    preview.value = true;
  }

  async function deletePost() {
    if (confirm("Delete the post?")) {
      await trpc.deletePost.mutate({ postId: post.id });
      location.href = "/";
    }
  }

  async function deleteComment(commentId: number) {
    if (confirm("Delete the comment?")) {
      await trpc.deleteComment.mutate({ commentId });
      await readComments();
    }
  }

  async function readComments() {
    setCommentLoading(true);
    const results = await trpc.getComments.query({ postId: post.id });
    setCommentLoading(false);
    setComments(results);
  }

  async function reply() {
    setLoading(true);
    await trpc.createComment.mutate({ postId: post.id, source: text.value });
    await readComments();
    text.value = "";
    sanitizedCommentHtml.value = "";
    displayEdit();
    setLoading(false);
  }

  async function like(postId: number) {
    if (!props.userId) {
      location.href = "/auth";
      return;
    }
    setRequesting(true);
    await trpc.createLike.mutate({ postId });
    setLiked(true);
    setLikes(likes + 1);
    setRequesting(false);
  }

  async function cancelLike(postId: number) {
    setRequesting(true);
    await trpc.cancelLike.mutate({ postId });
    setLiked(false);
    setLikes(likes - 1);
    setRequesting(false);
  }

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  useEffect(() => {
    if (textarea.current && location.hash === "#comment") {
      textarea.current.focus();
    }
  }, textarea.current);

  useEffect(() => {
    setLikes(post.likes);
    (async () => {
      const maybeliked = await trpc.isLiked.query({ postId: post.id });
      if (maybeliked) {
        setLiked(maybeliked);
      }
      await readComments();
    })();
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("posted")) {
      message.value = "Posted.";
      history.replaceState(null, "", location.pathname);
    } else if (searchParams.has("updated")) {
      message.value = "Updated.";
      history.replaceState(null, "", location.pathname);
    }
    Mousetrap.bind("e", () => {
      if (userId === post.user_id) {
        location.href = `/posts/${post.id}/edit`;
      }
    });
  }, []);

  useEffect(() => {
    if (preview.value) {
      Mousetrap.bind(
        "mod+p",
        () => {
          displayEdit();
          return false;
        },
      );
    } else {
      Mousetrap(textarea.current).bind(
        "mod+enter",
        () => {
          reply();
        },
      );
      Mousetrap(textarea.current).bind(
        "mod+p",
        () => {
          displayPreview();
          return false;
        },
      );
    }
  }, [preview.value]);

  const createdAt = new Date(post.created_at).toLocaleString();
  const updatedAt = new Date(post.updated_at).toLocaleString();

  function tweet() {
    const url = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(props.postTitle + "\n" + location.href);
    window.open(url);
    // location.href = url;
  }

  return (
    <div>
      {post &&
        (
          <>
            {message.value &&
              (
                <div
                  class="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {message.value}
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                  >
                  </button>
                </div>
              )}
            <div class="card mb-3">
              <div class="card-header bg-transparent d-flex justify-content-between">
                <div>
                  <img
                    src={post.picture!}
                    alt="mdo"
                    width="32"
                    height="32"
                    class="rounded-circle"
                    referrerpolicy="no-referrer"
                  />
                  <a
                    href={`/users/${post.user_id}`}
                    class="ms-2 me-2 noDecoration"
                  >
                    {post.name}
                  </a>
                </div>
                <div
                  title={`Created at: ${createdAt} , Updated at: ${updatedAt}`}
                >
                  {updatedAt}
                </div>
              </div>
              <article class="card-body">
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
                        PRIVATE
                      </span>
                      <div>This post is visible only to you.</div>
                    </div>
                  )}
                <section>
                  <span
                    class="post"
                    dangerouslySetInnerHTML={{ __html: postSource }}
                  >
                  </span>
                  <div class="d-flex justify-content-between">
                    <div>
                      <img
                        src="/assets/img/twitter.svg"
                        title="Tweet"
                        alt="Tweet"
                        width={20}
                        onClick={tweet}
                        style={{ cursor: "pointer" }}
                      />
                      {requesting &&
                        (
                          <div
                            class="spinner-grow spinner-grow-sm ms-3"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        )}
                      {userId && !requesting && liked &&
                        (
                          <img
                            src="/assets/img/heart-fill.svg"
                            title="Unlike"
                            alt="Unlike"
                            width="20"
                            height="20"
                            onClick={() => cancelLike(post.id)}
                            class="ms-3"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      {!requesting && !liked &&
                        (
                          <img
                            src="/assets/img/heart.svg"
                            title="Like"
                            alt="Like"
                            width="20"
                            height="20"
                            onClick={() => like(post.id)}
                            class="ms-3"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      {Number(likes) > 0 &&
                        (
                          <span
                            class="noDecoration ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => setModal(true)}
                          >
                            {likes} Like{likes === 1 ? "" : "s"}
                          </span>
                        )}
                    </div>
                    <div>
                      {userId === post.user_id &&
                        (
                          <>
                            <a
                              href={void (0)}
                              class="me-2"
                              style={{ cursor: "pointer" }}
                              onClick={deletePost}
                            >
                              <img
                                src="/assets/img/trash-fill.svg"
                                alt="Delete"
                                width="20"
                                height="20"
                              >
                              </img>
                            </a>
                            <a class="me-2" href={`/posts/${post.id}/edit`}>
                              <img
                                src="/assets/img/pencil-fill.svg"
                                alt="Edit"
                                width="20"
                                height="20"
                              >
                              </img>
                            </a>
                          </>
                        )}
                    </div>
                  </div>
                </section>
              </article>
              <div class="card-footer bg-transparent">
                {commentLoading &&
                  (
                    <div class="d-flex justify-content-center">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                {comments &&
                  comments.map((comment) => (
                    <div class="border-bottom ms-4">
                      <div class="d-flex justify-content-between">
                        <div>
                          <img
                            src={comment.app_user?.picture!}
                            alt="mdo"
                            width="32"
                            height="32"
                            class="rounded-circle"
                            referrerpolicy="no-referrer"
                          />
                          <a
                            href={`/users/${comment.user_id}`}
                            class="ms-2 me-2 noDecoration"
                          >
                            {comment.app_user?.name}
                          </a>
                          {new Date(comment.updated_at).toLocaleString()}
                        </div>
                        {userId === comment.user_id &&
                          (
                            <a
                              href={void (0)}
                              class="ms-2"
                              style={{ cursor: "pointer" }}
                              onClick={() => deleteComment(comment.id)}
                            >
                              <img
                                src="/assets/img/trash-fill.svg"
                                alt="Delete"
                                width="20"
                                height="20"
                              >
                              </img>
                            </a>
                          )}
                      </div>
                      <div>
                        <span
                          class="post"
                          dangerouslySetInnerHTML={{
                            __html: comment.source,
                          }}
                        >
                        </span>
                      </div>
                    </div>
                  ))}
                <div class="ms-4 mt-2">
                  {userId && (
                    <>
                      <div class="">
                        <ul class="nav nav-tabs">
                          <li class="nav-item">
                            <a
                              class={preview.value
                                ? "nav-link"
                                : "nav-link active"}
                              style={{ cursor: "pointer" }}
                              onClick={displayEdit}
                            >
                              Edit
                            </a>
                          </li>
                          <li class="nav-item">
                            <a
                              class={preview.value
                                ? "nav-link active"
                                : "nav-link"}
                              style={{ cursor: "pointer" }}
                              onClick={displayPreview}
                            >
                              Preview
                            </a>
                          </li>
                        </ul>
                        {!preview.value &&
                          (
                            <textarea
                              ref={textarea}
                              class="form-control mt-3"
                              style={{ height: "250px" }}
                              maxLength={5000}
                              value={text.value}
                              onInput={(event) =>
                                text.value = (event.target as any).value}
                              placeholder="Write a comment with markdown"
                            >
                            </textarea>
                          )}
                        {preview.value &&
                          (
                            <span
                              class="post"
                              dangerouslySetInnerHTML={{
                                __html: sanitizedCommentHtml.value,
                              }}
                            >
                            </span>
                          )}
                      </div>
                      <div class="mt-2">
                        <button
                          class="btn btn-primary"
                          onClick={reply}
                          disabled={loading || text.value.length === 0}
                        >
                          {loading &&
                            (
                              <span
                                class="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              >
                              </span>
                            )}
                          Reply
                        </button>
                      </div>
                    </>
                  )}
                  {!userId &&
                    (
                      <a class="btn btn-outline-secondary btn-sm" href="/auth">
                        Comment
                      </a>
                    )}
                </div>
              </div>
              {modal &&
                <LikeUsersModal postId={post.id} setModal={setModal} />}
            </div>
          </>
        )}
    </div>
  );
}
