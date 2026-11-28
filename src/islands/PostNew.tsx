import hljs from "highlight.js";
import { useRef, useState } from "react";
import Mousetrap from "mousetrap";
import { useEffect } from "react";
import { api } from "~/client/api.ts";
import { Form, useForm } from "@void/react";

export default function Post() {
  const form = useForm("/posts/new", { source: "", draft: false });
  const [preview, setPreview] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);

  function displayEdit() {
    setPreview(false);
  }

  async function displayPreview(source = form.data.source) {
    setSanitizedHtml(await api.md2html({
      source,
    }));
    setPreview(true);
  }

  useEffect(() => {
    hljs.highlightAll();
  });

  useEffect(() => {
    if (textarea.current) {
      textarea.current.focus();
    }
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
          ["mod+enter", "mod+s"],
          () => {
            post();
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
        const editorKeys = Mousetrap(textarea.current);
        editorKeys.unbind("mod+enter");
        editorKeys.unbind("mod+s");
        editorKeys.unbind("mod+p");
      }
    };
  }, [preview]);

  function post() {
    submitButton.current?.click();
  }

  return (
    <Form form={form}>
      <div className="card mb-3">
        <div className="card-body">
          <ul className="nav nav-tabs" style={{ marginBottom: "20px" }}>
            <li className="nav-item">
              <a
                className={!preview ? "nav-link active" : "nav-link"}
                style={{ cursor: "pointer" }}
                onClick={displayEdit}
              >
                Edit
              </a>
            </li>
            <li className="nav-item">
              <a
                className={preview ? "nav-link active" : "nav-link"}
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
                style={{ height: "500px" }}
                maxLength={10000}
                value={form.data.source}
                autoFocus
                onInput={(e) => form.setData("source", e.currentTarget.value)}
                placeholder="Write with Markdown"
              >
              </textarea>
            )}
          {preview &&
            (
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{
                  __html: sanitizedHtml,
                }}
              >
              </div>
            )}
        </div>
        <div className="card-footer text-end bg-transparent">
          <input
            className="form-check-input align-middle"
            style={{ marginRight: "5px", marginTop: "0px" }}
            type="checkbox"
            checked={form.data.draft}
            id="flexCheckDefault"
            onChange={(e) => form.setData("draft", e.currentTarget.checked)}
          />
          <label
            className="form-check-label"
            htmlFor="flexCheckDefault"
            style={{ marginRight: "10px" }}
          >
            Private
          </label>
          <button
            ref={submitButton}
            className="btn btn-primary"
            type="submit"
            disabled={form.pending || form.data.source.length === 0}
          >
            {form.pending &&
              (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                >
                </span>
              )}
            Post
          </button>
        </div>
      </div>
    </Form>
  );
}
