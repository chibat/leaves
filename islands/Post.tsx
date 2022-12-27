import { useSignal } from "@preact/signals";
import { marked } from 'marked'
import * as hljs from "highlightjs";
import DOMPurify from "dompurify";
import { useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import IconEdit from "tabler_icons_tsx/tsx/edit.tsx"
import IconEye from "tabler_icons_tsx/tsx/eye.tsx"

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

  return (
    <>
      <ul class="flex border-b border-gray-200 text-center mb-3">
        <li class="flex-1">
          {preview.value ?
            <span
              class="cursor-pointer block bg-gray-100 p-4 text-sm font-medium text-gray-500 ring-1 ring-inset ring-white"
              onClick={() => { preview.value = false; }}
            >
              <span class="flex items-center"><IconEdit class="w-6 h-6 mr-1" /> Edit</span>
            </span>
            :
            <span
              class="relative block border-t border-l border-r border-gray-200 bg-white p-4 text-sm font-medium"
            >
              <span class="absolute inset-x-0 -bottom-px h-px w-full bg-white"></span>
              <span class="flex items-center"><IconEdit class="w-6 h-6 mr-1" />Edit</span>
            </span>
          }
        </li>
        <li class="flex-1 pl-px">
          {preview.value ?
            <span
              class="relative block border-t border-l border-r border-gray-200 bg-white p-4 text-sm font-medium"
            >
              <span class="absolute inset-x-0 -bottom-px h-px w-full bg-white"></span>
              <span class="flex items-center"><IconEye class="w-6 h-6 mr-1" />Preview</span>
            </span>
            :
            <span
              class="cursor-pointer block bg-gray-100 p-4 text-sm font-medium text-gray-500 ring-1 ring-inset ring-white"
              onClick={() => { preview.value = true; }}
            >
              <span class="flex items-center"><IconEye class="w-6 h-6 mr-1" /> Preview</span>
            </span>
          }
        </li>
      </ul>
      <div>
        {preview.value ?
          // "prose" + "" は、editor 上の error 回避のため
          <><span class={"prose" + ""} dangerouslySetInnerHTML={{ __html: html.value }}></span></> :
          <>
            <div>
              <label class="sr-only" for="message">Message</label>
              <textarea maxLength={10000} value={text.value}
                class="w-full rounded-lg border-gray-200 p-3 text-sm border-1"
                onChange={e => text.value = (e.target as HTMLInputElement).value}
                placeholder="Write with markdown"
                rows={8}
                id="message"
              ></textarea>
            </div>
            <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Post</button>
            </div>
          </>
        }
      </div>
    </>
  );
}

