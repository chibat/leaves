import * as hljs from "highlightjs";
import { request } from '~/lib/request.ts'
import { LikeUsersModal } from '~/components/LikeUsersModal.tsx'

import type { RequestType as DeleteRequest, ResponseType as DeleteResponse } from "~/routes/api/delete_post.ts";
import type { RequestType as LikeRequest, ResponseType as LikeResponse } from "~/routes/api/create_like.ts";
import type { RequestType as CancelLikeRequest, ResponseType as CancelLikeResponse } from "~/routes/api/delete_like.ts";
import type { ResponsePost } from "~/lib/types.ts";
import { useState, useEffect } from "preact/hooks";
import { AppUser } from "~/lib/db.ts";
import { markedWithSanitaize } from "~/lib/utils.ts";
import { Signal } from "@preact/signals-core";

type Props = {
  posts: Signal<ResponsePost[]>,
  user?: AppUser,
}

export default function Posts(props: Props) {

  const [requesting, setRequesting] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>();

  useEffect(() => {
    console.debug("useEffect");
    (hljs as any).highlightAll();
  });

  async function deletePost(postId: number) {
    if (confirm("Delete the post?")) {
      await request<DeleteRequest, DeleteResponse>("delete_post", { postId });
      location.href = "/";
    }
  }

  async function like(post: ResponsePost) {
    setRequesting(true);
    await request<LikeRequest, LikeResponse>("create_like", { postId: post.id });
    post.liked = true;
    post.likes = "" + (Number(post.likes) + 1);
    setRequesting(false);
  }

  async function cancelLike(post: ResponsePost) {
    setRequesting(true);
    await request<CancelLikeRequest, CancelLikeResponse>("delete_like", { postId: post.id });
    post.liked = false;
    post.likes = "" + (Number(post.likes) - 1);
    setRequesting(false);
  }

  function openModal(postId: number) {
    setSelectedPostId(postId);
    setModal(true);
  }

  const user = props.user;
  console.debug("start ");

  return (
    <>
      {props.posts.value && props.posts.value.map(post =>
        <div class="card mb-3" key={post.id}>
          <div class="card-header bg-transparent d-flex justify-content-between">
            <div>
              <img src={post.picture} alt="mdo" width="32" height="32" class="rounded-circle" />
              <a href={`/users/${post.user_id}`} class="ms-2 noDecoration">{post.name}</a>
              <a href={`/posts/${post.id}`} class="ms-2 noDecoration">{new Date(post.updated_at).toLocaleString()}</a>
            </div>
            {user && user.id === post.user_id &&
              <div>
                <a href={`/posts/${post.id}/edit`}><img src="/assets/img/pencil-fill.svg" alt="Edit" width="20" height="20"></img></a>
                <a href={void (0)} class="ms-2" onClick={() => deletePost(post.id)}><img src="/assets/img/trash-fill.svg" alt="Delete" width="20" height="20"></img></a>
              </div>
            }
          </div>
          <div class="card-body">
            <span dangerouslySetInnerHTML={{ __html: markedWithSanitaize(post.source) }}></span>
          </div>
          {(user || Number(post.comments) > 0 || Number(post.likes) > 0) &&
            <div class="card-footer bg-transparent">
              {user &&
                <a class="btn btn-outline-secondary btn-sm" href={`/posts/${post.id}`}>Comment</a>
              }
              {Number(post.comments) > 0 &&
                <a class="ms-2 noDecoration" href={`/posts/${post.id}`}>{post.comments} Comment{post.comments === "1" ? "" : "s"}</a>
              }
              {requesting &&
                <div class="spinner-grow spinner-grow-sm ms-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              }
              {user && !requesting && post.liked &&
                <a href={void (0)} onClick={() => cancelLike(post)} class="ms-3"><img src="/assets/img/heart-fill.svg" alt="Edit" width="20" height="20"></img></a>
              }
              {user && !requesting && !post.liked &&
                <a href={void (0)} onClick={() => like(post)} class="ms-3"><img src="/assets/img/heart.svg" alt="Edit" width="20" height="20"></img></a>
              }
              {Number(post.likes) > 0 &&
                <a href={void (0)} class="noDecoration ms-2" onClick={() => openModal(post.id)} style={{ cursor: "pointer" }}>{post.likes} Like{post.likes === "1" ? "" : "s"}</a>
              }
            </div>
          }
        </div>
      )}
      {modal && selectedPostId &&
        <LikeUsersModal postId={selectedPostId} setModal={setModal} />
      }
    </>
  );
}
