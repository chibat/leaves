import { useSignal } from "@preact/signals";
import { marked } from 'marked'
import * as hljs from "highlightjs";
import DOMPurify from "dompurify";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

if (IS_BROWSER) {
  DOMPurify.addHook("uponSanitizeElement", (node: any, data) => {
    if (data.tagName === "iframe") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("https://www.youtube.com/embed/")) {
        return node.parentNode.removeChild(node);
      }
    }
  });
}

interface CounterProps {
  start?: number;
}

export default function Post(props: CounterProps) {
  const preview = useSignal(false);
  const loading = useSignal(false);
  const text = useSignal('');
  const html = useSignal('');

  useEffect(() => {
    console.log("### ", IS_BROWSER);
    console.log("useEffect Post");
    (hljs as any).highlightAll();
  });

  useEffect(() => {
    html.value = DOMPurify.sanitize(marked(text.value), {
      ADD_TAGS: ["iframe"], //or ALLOWED_TAGS
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],//or //or ALLOWED_ATR
    });
    console.log("useEffect text", html.value);
  }, [text.value]);

  async function post() {
    loading.value = true;
    // const result = await request<RequestType, ResponseType>("create_post", { source: text });
    loading.value = false;
  //   if (result.postId) {
  //     router.push(`/posts/${result.postId}`);
  //     return;
  //   }
  }

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={!preview.value ? "nav-link active" : "nav-link"} style={{cursor: "pointer"}} onClick={() => preview.value = false}>Edit</a>
            </li>
            <li className="nav-item">
              <a className={preview.value ? "nav-link active" : "nav-link"} style={{cursor: "pointer"}} onClick={() => preview.value = true}>Preview</a>
            </li>
          </ul>
          {!preview.value &&
            <textarea className="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text.value}
              onChange={e => text.value = (e.target as any).value}
              placeholder="Write with markdown"></textarea>
          }
          {preview.value &&
            <span dangerouslySetInnerHTML={{ __html: html.value }}></span>
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

