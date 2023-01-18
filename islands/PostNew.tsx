import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import { useEffect } from "preact/hooks";
import { CreatePostRequest, CreatePostResponse } from "~/routes/api/create_post.ts";
import { request } from "~/lib/request.ts";
import { markedWithSanitaize } from "~/lib/utils.ts";

export default function Post() {
  const preview = useSignal(false);
  const loading = useSignal(false);
  const text = useSignal('');

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  async function post() {
    loading.value = true;
    const result = await request<CreatePostRequest, CreatePostResponse>("create_post", { source: text.value });
    loading.value = false;
    if (result.postId) {
      location.href = `/posts/${result.postId}?posted`;
      return;
    }
  }

  return (
    <>
      <div class="card mb-3">
        <div class="card-body">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class={!preview.value ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={() => preview.value = false}>Edit</a>
            </li>
            <li class="nav-item">
              <a class={preview.value ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={() => preview.value = true}>Preview</a>
            </li>
          </ul>
          {!preview.value &&
            <textarea class="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text.value}
              onChange={e => text.value = (e.target as any).value}
              placeholder="Write with markdown"></textarea>
          }
          {preview.value &&
            <span class="post" dangerouslySetInnerHTML={{ __html: markedWithSanitaize(text.value) }}></span>
          }
        </div>
        <div class="card-footer text-end bg-transparent">
          <button class="btn btn-primary" onClick={post} disabled={loading.value || text.value.length === 0}>
            {loading.value &&
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            }
            Post
          </button>
        </div>
      </div>
    </>
  );
}

