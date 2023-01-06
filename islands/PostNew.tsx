import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import DOMPurify from "dompurify";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { CreatePostRequest, CreatePostResponse } from "~/routes/api/create_post.ts";
import { request } from "~/lib/request.ts";
import { markedWithSanitaize } from "~/lib/utils.ts";

if (IS_BROWSER) {
  // https://github.com/cure53/DOMPurify/issues/340#issuecomment-670758980
  DOMPurify.addHook("uponSanitizeElement", (node: any, data) => {
    if (data.tagName === "iframe") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("https://www.youtube.com/embed/")) {
        return node.parentNode.removeChild(node);
      }
    }
  });
}

export default function Post() {
  const preview = useSignal(false);
  const loading = useSignal(false);
  const text = useSignal('');
  const html = useSignal('');

  useEffect(() => {
    console.log("### ", IS_BROWSER);
    console.log("useEffect Post");
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
      <div className="card mb-3">
        <div className="card-body">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={!preview.value ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={() => preview.value = false}>Edit</a>
            </li>
            <li className="nav-item">
              <a className={preview.value ? "nav-link active" : "nav-link"} style={{ cursor: "pointer" }} onClick={() => preview.value = true}>Preview</a>
            </li>
          </ul>
          {!preview.value &&
            <textarea className="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text.value}
              onChange={e => text.value = (e.target as any).value}
              placeholder="Write with markdown"></textarea>
          }
          {preview.value &&
            <span dangerouslySetInnerHTML={{ __html: markedWithSanitaize(text.value) }}></span>
          }
        </div>
        <div class="card-footer text-end bg-transparent">
          <button className="btn btn-primary" onClick={post} disabled={loading.value || text.value.length === 0}>
            {loading.value &&
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            }
            Post
          </button>
        </div>
      </div>
    </>
  );
}

