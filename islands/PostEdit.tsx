import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import { useState, useEffect } from "preact/hooks";
import type { RequestType as UpdateRequest, ResponseType as UpdateResponse } from '~/routes/api/update_post.ts'
import { request } from "~/lib/request.ts";
import { Post } from "~/lib/db.ts";
import { markedWithSanitaize } from "../lib/utils.ts";

export default function Edit(props: { post: Post }) {

  const postId = props.post.id;

  const [flag, setFlag] = useState<boolean>(true);
  const text = useSignal(props.post.source);
  const [loading, setLoading] = useState<boolean>(false);

  function displayEdit() {
    setFlag(true);
  }

  function displayPreview() {
    setFlag(false);
  }

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  async function save() {
    if (confirm("Save the post?")) {
      setLoading(true);
      await request<UpdateRequest, UpdateResponse>("update_post", { postId: postId, source: text.value });
      setLoading(false);
      location.href = `/posts/${postId}?updated`;
    }
  }

  return (
    <>
      <head>
        <title>Edit - md-sns</title>
      </head>
      <div class="card mb-3">
        <div class="card-body">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class={flag ? "nav-link active" : "nav-link"} onClick={displayEdit}>Edit</a>
            </li>
            <li class="nav-item">
              <a class={!flag ? "nav-link active" : "nav-link"} onClick={displayPreview}>Preview</a>
            </li>
          </ul>
          {flag &&
            <textarea class="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text.value}
              onChange={(e) => text.value = (e.target as any).value}>
            </textarea>
          }
          {!flag &&
            <span dangerouslySetInnerHTML={{ __html: markedWithSanitaize(text.value) }}></span>
          }
        </div>
        <div class="card-footer bg-transparent">
          <button class="btn btn-primary" onClick={save} disabled={loading || text.value.length === 0}>
            {loading &&
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            }
            Save
          </button>
        </div>
      </div>
    </>
  );
}
