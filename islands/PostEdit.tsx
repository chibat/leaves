import { useSignal } from "@preact/signals";
import * as hljs from "highlightjs";
import { useEffect, useState } from "preact/hooks";
import { Post } from "~/server/db.ts";
import { trpc } from "~/client/trpc.ts";

export default function Edit(props: { post: Post }) {
  const postId = props.post.id;

  const [flag, setFlag] = useState<boolean>(true);
  const text = useSignal(props.post.source);
  const draft = useSignal(props.post.draft);
  const sanitizedHtml = useSignal("");
  const [loading, setLoading] = useState<boolean>(false);

  function displayEdit() {
    setFlag(true);
  }

  async function displayPreview() {
    sanitizedHtml.value = await trpc.md2html.query({
      source: text.value,
    });
    setFlag(false);
  }

  useEffect(() => {
    (hljs as any).highlightAll();
  });

  async function save() {
    setLoading(true);
    await trpc.updatePost.mutate({
      postId: postId,
      source: text.value,
      draft: draft.value,
    });
    setLoading(false);
    location.href = `/posts/${postId}?updated`;
  }

  return (
    <>
      <head>
        <title>Edit - Leaves</title>
      </head>
      <div class="card mb-3">
        <div class="card-body">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a
                class={flag ? "nav-link active" : "nav-link"}
                onClick={displayEdit}
              >
                Edit
              </a>
            </li>
            <li class="nav-item">
              <a
                class={!flag ? "nav-link active" : "nav-link"}
                onClick={displayPreview}
              >
                Preview
              </a>
            </li>
          </ul>
          {flag &&
            (
              <textarea
                class="form-control mt-3"
                style={{ height: "500px" }}
                maxLength={10000}
                value={text.value}
                autofocus
                onChange={(e) => text.value = (e.target as any).value}
              >
              </textarea>
            )}
          {!flag &&
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
            onClick={save}
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
            Save
          </button>
        </div>
      </div>
    </>
  );
}
