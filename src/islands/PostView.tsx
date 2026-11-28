import { useEffect, useState } from "react";
import hljs from "highlight.js";
import Mousetrap from "mousetrap";
import type { PostViewType } from "~/server/db.ts";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";
import { render } from "~/server/markdown.ts";
import { api } from "~/client/api.ts";
import { useRef } from "react";
import { formatHydrationSafeDateTime } from "~/common/date_format.ts";
import { Link, useRouter } from "@void/react";

type Comments = Awaited<ReturnType<typeof api.getComments>>;

export default function PostView(
  props: { post: PostViewType; postTitle: string; userId?: number },
) {
  const userId = props.userId;
  const post = props.post;

  const [preview, setPreview] = useState(false);
  const [text, setText] = useState("");
  const [sanitizedCommentHtml, setSanitizedCommentHtml] = useState("");
  const postSource = render(props.post.source, {});
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>();
  const [comments, setComments] = useState<Comments>();
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(true);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [dateDisplay, setDateDisplay] = useState(() => ({
    createdAt: formatHydrationSafeDateTime(new Date(post.created_at)),
    updatedAt: formatHydrationSafeDateTime(new Date(post.updated_at)),
  }));

  function displayEdit() {
    setPreview(false);
  }

  async function displayPreview(source = text) {
    setSanitizedCommentHtml(await api.md2html({
      source,
    }));
    setPreview(true);
  }

  async function deletePost() {
    if (confirm("Delete the post?")) {
      await api.deletePost({ postId: post.id });
      await router.visit("/");
    }
  }

  async function deleteComment(commentId: number) {
    if (confirm("Delete the comment?")) {
      await api.deleteComment({ commentId });
      await readComments();
    }
  }

  async function readComments() {
    setCommentLoading(true);
    const results = await api.getComments({ postId: post.id });
    setCommentLoading(false);
    setComments(results);
  }

  async function reply(source = text) {
    setLoading(true);
    await api.createComment({ postId: post.id, source });
    await readComments();
    setText("");
    setSanitizedCommentHtml("");
    displayEdit();
    setLoading(false);
  }

  async function like(postId: number) {
    if (!props.userId) {
      location.href = "/auth";
      return;
    }
    setRequesting(true);
    await api.createLike({ postId });
    setLiked(true);
    setLikes(likes + 1);
    setRequesting(false);
  }

  async function cancelLike(postId: number) {
    setRequesting(true);
    await api.cancelLike({ postId });
    setLiked(false);
    setLikes(likes - 1);
    setRequesting(false);
  }

  useEffect(() => {
    hljs.highlightAll();
  });

  useEffect(() => {
    if (textarea.current && location.hash === "#comment") {
      textarea.current.focus();
    }
  }, []);

  useEffect(() => {
    setDateDisplay({
      createdAt: new Date(post.created_at).toLocaleString(),
      updatedAt: new Date(post.updated_at).toLocaleString(),
    });
  }, [post.created_at, post.updated_at]);

  useEffect(() => {
    setLikes(post.likes);
    (async () => {
      if (userId !== undefined) {
        setLiked(await api.isLiked({ postId: post.id }));
      }
      await readComments();
    })();
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("posted")) {
      setMessage("Posted.");
      history.replaceState(null, "", location.pathname);
    } else if (searchParams.has("updated")) {
      setMessage("Updated.");
      history.replaceState(null, "", location.pathname);
    }
    Mousetrap.bind("e", () => {
      if (userId === post.user_id) {
        void router.visit(`/posts/${post.id}/edit`);
      }
    });
    return () => {
      Mousetrap.unbind("e");
    };
  }, []);

  useEffect(() => {
    if (preview) {
      Mousetrap.bind(
        "mod+p",
        () => {
          displayEdit();
          return false;
        },
      );
    } else {
      if (textarea.current) {
        Mousetrap(textarea.current).bind(
          "mod+enter",
          () => {
            void reply(textarea.current?.value ?? "");
            return false;
          },
        );
        Mousetrap(textarea.current).bind(
          "mod+p",
          () => {
            displayPreview(textarea.current?.value ?? "");
            return false;
          },
        );
      }
    }
    return () => {
      Mousetrap.unbind("mod+p");
      if (textarea.current) {
        const commentKeys = Mousetrap(textarea.current);
        commentKeys.unbind("mod+enter");
        commentKeys.unbind("mod+p");
      }
    };
  }, [preview]);

  function tweet() {
    const url = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(props.postTitle + "\n" + location.href);
    globalThis.open(url);
  }

  function bluesky() {
    const url = "https://bsky.app/intent/compose?text=" +
      encodeURIComponent(props.postTitle + "\n" + location.href);
    globalThis.open(url);
  }

  return (
    <div>
      {post &&
        (
          <>
            {message &&
              (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {message}
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                  >
                  </button>
                </div>
              )}
            <div className="card mb-3">
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
                    className="ms-2 me-2 noDecoration"
                  >
                    {post.name}
                  </Link>
                </div>
                <div
                  title={`Created at: ${dateDisplay.createdAt} , Updated at: ${dateDisplay.updatedAt}`}
                >
                  {dateDisplay.updatedAt}
                </div>
              </div>
              <article className="card-body">
                {post.draft &&
                  (
                    <span className="badge bg-danger mb-2">
                      🔒 PRIVATE
                    </span>
                  )}
                <section>
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: postSource }}
                  >
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <img
                        src="/assets/img/twitter.svg"
                        title="Tweet"
                        alt="Tweet"
                        width={20}
                        onClick={tweet}
                        style={{ cursor: "pointer" }}
                      />
                      <img
                        className="ms-3"
                        src="/assets/img/bluesky.svg"
                        title="Bluesky"
                        alt="Bluesky"
                        width={20}
                        onClick={bluesky}
                        style={{ cursor: "pointer" }}
                      />
                      {requesting &&
                        (
                          <div
                            className="spinner-grow spinner-grow-sm ms-3"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
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
                            className="ms-3"
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
                            className="ms-3"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      {Number(likes) > 0 &&
                        (
                          <span
                            className="noDecoration ms-2"
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
                              className="me-2"
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
                            <Link className="me-2" href={`/posts/${post.id}/edit`}>
                              <img
                                src="/assets/img/pencil-fill.svg"
                                alt="Edit"
                                width="20"
                                height="20"
                              >
                              </img>
                            </Link>
                          </>
                        )}
                    </div>
                  </div>
                </section>
              </article>
              <div className="card-footer bg-transparent">
                {
                  /* {commentLoading &&
                  (
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )} */
                }
                {comments &&
                  comments.map((comment) => (
                    <div className="border-bottom ms-4">
                      <div className="d-flex justify-content-between">
                        <div>
                          <img
                            src={comment.app_user?.picture!}
                            alt="mdo"
                            width="32"
                            height="32"
                            className="rounded-circle"
                            referrerPolicy="no-referrer"
                          />
                          <Link
                            href={`/users/${comment.user_id}`}
                            className="ms-2 me-2 noDecoration"
                          >
                            {comment.app_user?.name}
                          </Link>
                          {new Date(comment.updated_at).toLocaleString()}
                        </div>
                        {userId === comment.user_id &&
                          (
                            <a
                              href={void (0)}
                              className="ms-2"
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
                        <div
                          className="markdown-body"
                          dangerouslySetInnerHTML={{
                            __html: comment.source,
                          }}
                        >
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="ms-4 mt-2">
                  {userId && (
                    <>
                      <div className="">
                        <ul className="nav nav-tabs">
                          <li className="nav-item">
                            <a
                              className={preview
                                ? "nav-link"
                                : "nav-link active"}
                              style={{ cursor: "pointer" }}
                              onClick={displayEdit}
                            >
                              Edit
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={preview
                                ? "nav-link active"
                                : "nav-link"}
                              style={{ cursor: "pointer" }}
                              onClick={() => void displayPreview()}
                            >
                              Preview
                            </a>
                          </li>
                        </ul>
                        {!preview &&
                          (
                            <textarea
                              ref={textarea}
                              className="form-control mt-3"
                              style={{ height: "250px" }}
                              maxLength={5000}
                              value={text}
                              onInput={(event) =>
                                setText(event.currentTarget.value)}
                              placeholder="Write a comment with markdown"
                            >
                            </textarea>
                          )}
                        {preview &&
                          (
                            <div
                              className="markdown-body"
                              dangerouslySetInnerHTML={{
                                __html: sanitizedCommentHtml,
                              }}
                            >
                            </div>
                          )}
                      </div>
                      <div className="mt-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => void reply()}
                          disabled={loading || text.length === 0}
                        >
                          {loading &&
                            (
                              <span
                                className="spinner-border spinner-border-sm me-2"
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
                      <a className="btn btn-outline-secondary btn-sm" href="/auth">
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
