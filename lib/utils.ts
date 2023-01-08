import { marked } from "marked";
import DOMPurify from "dompurify";
import { IS_BROWSER } from "$fresh/runtime.ts";

if (IS_BROWSER) {
  // https://github.com/cure53/DOMPurify/issues/340#issuecomment-670758980
  DOMPurify.addHook("uponSanitizeElement", (node: any, data) => {
    if (data.tagName === "iframe") {
      const src = node.getAttribute("src") || "";
      if (
        !src.startsWith("https://www.youtube.com/embed/") &&
        !src.startsWith("https://ogp.deno.dev/")
      ) {
        return node.parentNode.removeChild(node);
      }
    }
  });
}

export function defaultString(str: string | null | undefined): string {
  return str ? str : "";
}

marked.setOptions({ breaks: true });

export function markedWithSanitaize(value: string): string {
  if (!value) {
    return "";
  }
  return DOMPurify.sanitize(marked(value), {
    ADD_TAGS: ["iframe"], //or ALLOWED_TAGS
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"], //or //or ALLOWED_ATR
  });
}
