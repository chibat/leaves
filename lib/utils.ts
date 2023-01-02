import { marked } from "marked";
import DOMPurify from "dompurify";

export function defaultString(str: string | null | undefined): string {
  return str ? str : "";
}

export function markedWithSanitaize(value: string): string {
  if (!value) {
    return "";
  }
  return DOMPurify.sanitize(marked(value), {
    ADD_TAGS: ["iframe"], //or ALLOWED_TAGS
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"], //or //or ALLOWED_ATR
  });
}
