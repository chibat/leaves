import { AppUser, Comment, Post } from "~/lib/db.ts";

import type { RequestType as DeleteRequest, ResponseType as DeleteResponse } from "~/routes/api/delete_post.ts";
import type { RequestType as DeleteCommentRequest, ResponseType as DeleteCommentResponse } from "~/routes/api/delete_comment.ts";
import type { RequestType as LikeRequest, ResponseType as LikeResponse } from "~/routes/api/create_like.ts";
import type { RequestType as CancelLikeRequest, ResponseType as CancelLikeResponse } from "~/routes/api/delete_like.ts";

import { request } from "~/lib/request.ts";
import { useEffect, useState } from "preact/hooks";
import * as hljs from "highlightjs";
import { LikeUsersModal } from "~/components/LikeUsersModal.tsx";
import { markedWithSanitaize } from "~/lib/utils.ts";
import { useSignal } from "@preact/signals";
import { trpc } from "~/trpc/client.ts";

export default function PostView(props: { post: Post, user?: AppUser }) {
  const user = props.user;
  const post = props.post;

  const [flag, setFlag] = useState<boolean>(true);
  const [commentSource, setCommentSource] = useState<string>("");
  const [postSource, setPostSource] = useState<string>("");
  const [likes, setLikes] = useState<string>('0');
  const [liked, setLiked] = useState<boolean>();
  const [comments, setComments] = useState<Comment[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(true);
  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const message = useSignal("");

  useEffect(() => {
    setPostSource(markedWithSanitaize(post.source));
  }, []);

  function displayEdit() {
    setFlag(true);
  }

  function displayPreview() {
    setFlag(false);
  }

  async function deletePost() {
    if (confirm("Delete the post?")) {
      await request<DeleteRequest, DeleteResponse>("delete_post", { postId: post.id });
      location.href = "/";
    }
  }

  async function deleteComment(commentId: number) {
    if (confirm("Delete the comment?")) {
      await request<DeleteCommentRequest, DeleteCommentResponse>("delete_comment", { commentId });
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
    await trpc.createComment.mutate({ postId: post.id, source: commentSource });
    await readComments();
    setCommentSource("");
    setLoading(false);
  }

  async function like(postId: number) {
    if (!props.user) {
      location.href = "/auth";
      return;
    }
    setRequesting(true);
    await request<LikeRequest, LikeResponse>("create_like", { postId });
    setLiked(true);
    setLikes("" + (Number(likes) + 1));
    setRequesting(false);
  }

  async function cancelLike(postId: number) {
    setRequesting(true);
    await request<CancelLikeRequest, CancelLikeResponse>("delete_like", { postId });
    setLiked(false);
    setLikes("" + (Number(likes) - 1));
    setRequesting(false);
  }

  useEffect(() => {
    setLikes(post.likes);
    (async () => {
      const _liked = await trpc.isLiked.query({ postId: post.id });
      setLiked(_liked);
      await readComments();
    })();
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.has("posted")) {
      message.value = "Posted.";
      history.replaceState(null, '', location.pathname);
    } else if (searchParams.has("updated")) {
      message.value = "Updated.";
      history.replaceState(null, '', location.pathname);
    }
  }, []);

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  return (
    <div>
      {post &&
        <>

          {message.value &&
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              {message.value}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          }
          <div class="card mb-3">
            <div class="card-header bg-transparent d-flex justify-content-between">
              <div>
                <img src={post.picture} alt="mdo" width="32" height="32" class="rounded-circle" />
                <a href={`/users/${post.user_id}`} class="ms-2 me-2 noDecoration">{post.name}</a>
              </div>
              <div>
                {new Date(post.updated_at).toLocaleString()}
              </div>
            </div>
            <div class="card-body">
              <span class="post" dangerouslySetInnerHTML={{ __html: postSource }}></span>
              <div class="d-flex justify-content-between">
                <div>
                  {requesting &&
                    <div class="spinner-grow spinner-grow-sm ms-3" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  }
                  {user && !requesting && liked &&
                    <a href={void (0)} onClick={() => cancelLike(post.id)} class="ms-3" style={{ cursor: "pointer" }}>
                      <img src="/assets/img/heart-fill.svg" alt="Edit" width="20" height="20"></img>
                    </a>
                  }
                  {!requesting && !liked &&
                    <a href={void (0)} onClick={() => like(post.id)} class="ms-3" style={{ cursor: "pointer" }}>
                      <img src="/assets/img/heart.svg" alt="Edit" width="20" height="20"></img>
                    </a>
                  }
                  {Number(likes) > 0 &&
                    <a href={void (0)} class="noDecoration ms-2" style={{ cursor: "pointer" }} onClick={() => setModal(true)}>
                      {likes} Like{likes === "1" ? "" : "s"}
                    </a>
                  }
                </div>
                {user?.id === post.user_id &&
                  <div>
                    <a href={void (0)} class="me-2" style={{ cursor: "pointer" }} onClick={deletePost}>
                      <img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img>
                    </a>
                    <a href={`/posts/${post.id}/edit`}><img src="/assets/img/pencil-fill.svg" alt="Edit" width="20" height="20"></img></a>
                  </div>
                }
              </div>
            </div>
            <div class="card-footer bg-transparent">
              {commentLoading &&
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              }
              {comments && comments.map(comment =>
                <div class="border-bottom ms-4">
                  <div class="d-flex justify-content-between">
                    <div>
                      <img src={comment.picture} alt="mdo" width="32" height="32" class="rounded-circle" />
                      <a href={`/users/${comment.user_id}`} class="ms-2 me-2 noDecoration">{comment.name}</a>
                      {new Date(comment.updated_at).toLocaleString()}
                    </div>
                    {user?.id === comment.user_id &&
                      <a href={void (0)} class="ms-2" style={{ cursor: "pointer" }} onClick={() => deleteComment(comment.id)}>
                        <img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img>
                      </a>
                    }
                  </div>
                  <div>
                    <span class="post" dangerouslySetInnerHTML={{ __html: markedWithSanitaize(comment.source) }}></span>
                  </div>
                </div>
              )}
              <div class="ms-4 mt-2">
                {user && <>
                  <div class="">
                    <ul class="nav nav-tabs">
                      <li class="nav-item">
                        <a class={flag ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={displayEdit}>Edit</a>
                      </li>
                      <li class="nav-item">
                        <a class={!flag ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={displayPreview}>Preview</a>
                      </li>
                    </ul>
                    {flag &&
                      <textarea class="form-control mt-3" style={{ height: "250px" }} maxLength={5000} value={commentSource} onChange={(event) =>
                        setCommentSource((event.target as any).value)
                      } placeholder="Write a comment with markdown">
                      </textarea>
                    }
                    {!flag &&
                      <span class="post" dangerouslySetInnerHTML={{ __html: markedWithSanitaize(commentSource) }}></span>
                    }
                  </div>
                  <div class="mt-2">
                    <button class="btn btn-primary" onClick={reply} disabled={loading || commentSource.length === 0}>
                      {loading &&
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      }
                      Reply
                    </button>
                  </div></>
                }
                {!user &&
                  <a class="btn btn-outline-secondary btn-sm" href="/auth">Comment</a>
                }
              </div>
            </div>
            {modal &&
              <LikeUsersModal postId={post.id} setModal={setModal} />
            }
          </div>
        </>
      }
    </div>
  );
}
