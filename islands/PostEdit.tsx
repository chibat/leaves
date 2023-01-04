import * as hljs from "highlightjs";
import { marked } from "marked";
import { useState, useEffect } from "preact/hooks";
import type { RequestType as UpdateRequest, ResponseType as UpdateResponse } from '~/routes/api/update_post.ts'
import { request } from "~/lib/request.ts";
import { Post } from "~/lib/db.ts";

export default function Edit(props: { post: Post }) {

  const postId = props.post.id;

  const [flag, setFlag] = useState<boolean>(true);
  const [text, setText] = useState<string>(props.post.source);
  const [loading, setLoading] = useState<boolean>(false);

  function displayEdit() {
    setFlag(true);
  }

  function displayPreview() {
    setFlag(false);
  }

  useEffect(() => {
    console.debug("useEffect");
    (hljs as any).highlightAll();
  });

  async function save() {
    if (confirm("Save the post?")) {
      setLoading(true);
      await request<UpdateRequest, UpdateResponse>("update_post", { postId: postId, source: text });
      setLoading(false);
      location.href = `/posts/${postId}`;
    }
  }

  return (
    <>
      <head>
        <title>Edit - md-sns</title>
      </head>
      <div className="card mb-3">
        <div className="card-body">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={flag ? "nav-link active" : "nav-link"} onClick={displayEdit}>Edit</a>
            </li>
            <li className="nav-item">
              <a className={!flag ? "nav-link active" : "nav-link"} onClick={displayPreview}>Preview</a>
            </li>
          </ul>
          {flag &&
            <textarea className="form-control mt-3" style={{ height: "500px" }} maxLength={10000} value={text}
              onChange={(e) => setText((e.target as any).value)}>
            </textarea>
          }
          {!flag &&
            <span dangerouslySetInnerHTML={{ __html: marked(text) }}></span>
          }
        </div>
        <div className="card-footer bg-transparent">
          <button className="btn btn-primary" onClick={save} disabled={loading || text.length === 0}>
            {loading &&
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            }
            Save
          </button>
        </div>
      </div>
    </>
  );
}
