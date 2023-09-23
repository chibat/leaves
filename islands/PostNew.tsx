import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import { createRef } from "preact";
import Mousetrap from "mousetrap";
import { useEffect } from "preact/hooks";
import { trpc } from "~/client/trpc.ts";

export default function Post() {
  const preview = useSignal(false);
  const loading = useSignal(false);
  const draft = useSignal(false);
  const text = useSignal("");
  const sanitizedHtml = useSignal("");
  const textarea = createRef();

  useEffect(() => {
    (hljs as any).highlightAll();
  });
  useEffect(() => {
    if (!preview.value) {
      Mousetrap(textarea.current).bind(
        "mod+enter",
        () => {
          text.value = textarea.current.value;
          post();
        },
      );
    }
  }, [preview.value]);

  async function post() {
    loading.value = true;
    const result = await trpc.createPost.mutate({
      source: text.value,
      draft: draft.value,
    });
    loading.value = false;
    if (result?.postId) {
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
              <a
                class={!preview.value ? "nav-link active" : "nav-link"}
                style={{ cursor: "pointer" }}
                onClick={() => preview.value = false}
              >
                Edit
              </a>
            </li>
            <li class="nav-item">
              <a
                class={preview.value ? "nav-link active" : "nav-link"}
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  sanitizedHtml.value = await trpc.md2html.query({
                    source: text.value,
                  });
                  preview.value = true;
                }}
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
                style={{ height: "500px" }}
                maxLength={10000}
                value={text.value}
                autofocus
                onChange={(e) => text.value = (e.target as any).value}
                placeholder="Write with markdown"
              >
              </textarea>
            )}
          {preview.value &&
            (
              <span
                class="post"
                dangerouslySetInnerHTML={{
                  __html: sanitizedHtml.value,
                }}
              >
              </span>
            )}
        </div>
        <div class="card-footer text-end bg-transparent">
          <input
            class="form-check-input align-middle"
            style={{ marginRight: "5px", marginTop: "0px" }}
            type="checkbox"
            checked={draft.value}
            id="flexCheckDefault"
            onChange={(e) => {
              draft.value = !draft.value;
            }}
          />
          <label
            class="form-check-label"
            for="flexCheckDefault"
            style={{ marginRight: "10px" }}
          >
            Draft
          </label>
          <button
            class="btn btn-primary"
            onClick={post}
            disabled={loading.value || text.value.length === 0}
          >
            {loading.value &&
              (
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                >
                </span>
              )}
            Post
          </button>
        </div>
      </div>
    </>
  );
}
