// Original: https://github.com/denoland/deno-gfm/blob/6f4b8ae149b1f044037986929f096434b06bd726/mod.ts
import * as Marked from "marked";
//import { default as Prism } from "prismjs";
import { default as sanitizeHtml } from "sanitize-html";
//import { escape as htmlEscape } from "he";
// import "https://esm.sh/prismjs@1.29.0/components/prism-jsx?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-typescript?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-tsx?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-bash?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-powershell?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-json?no-check&pin=v57";
// import "https://esm.sh/prismjs@1.29.0/components/prism-diff?no-check&pin=v57";

class Renderer extends Marked.Renderer {
  // heading(
  //   text: string,
  //   level: 1 | 2 | 3 | 4 | 5 | 6,
  //   raw: string,
  //   slugger: Marked.Slugger,
  // ): string {
  //   const slug = slugger.slug(raw);
  //   return `<h${level} id="${slug}"><a class="anchor" aria-hidden="true" tabindex="-1" href="#${slug}"><svg class="octicon octicon-link" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg></a>${text}</h${level}>`;
  // }

  // image(src: string, title: string | null, alt: string | null) {
  //   return `<img src="${src}" alt="${alt ?? ""}" title="${title ?? ""}" />`;
  // }

  // code(code: string, language?: string) {
  //   // a language of `ts, ignore` should really be `ts`
  //   // and it should be lowercase to ensure it has parity with regular github markdown
  //   language = language?.split(",")?.[0].toLocaleLowerCase();
  //
  //   // transform math code blocks into HTML+MathML
  //   // https://github.blog/changelog/2022-06-28-fenced-block-syntax-for-mathematical-expressions/
  //   const grammar =
  //     language && Object.hasOwnProperty.call(Prism.languages, language)
  //       ? Prism.languages[language]
  //       : undefined;
  //   if (grammar === undefined) {
  //     return `<pre><code class="notranslate">${htmlEscape(code)}</code></pre>`;
  //   }
  //   const html = Prism.highlight(code, grammar, language!);
  //   return `<div class="highlight highlight-source-${language} notranslate"><pre>${html}</pre></div>`;
  // }

  override link(href: string, title: string, text: string) {
    if (href.startsWith("#")) {
      return `<a href="${href}" title="${title}">${text}</a>`;
    }
    if (this.options.baseUrl) {
      href = new URL(href, this.options.baseUrl).href;
    }
    if (title === undefined && href === text) {
      const youtubeTag = youtube(href);
      if (youtubeTag) {
        return youtubeTag;
      }
    }
    if (text === "_preview_large") {
      return `<iframe src="https://ogp.deno.dev/?size=large&url=${encodeURIComponent(href)
        }" height="350" width="500"></iframe>`;
    } else if (text === "_preview_small") {
      return `<iframe src="https://ogp.deno.dev/?size=small&url=${encodeURIComponent(href)
        }" height="150" style="width: 100%;"></iframe>`;
    }
    return `<a href="${href}" title="${title}" rel="noopener noreferrer" target="_blank">${text}</a>`;
  }
}

export interface RenderOptions {
  baseUrl?: string;
  mediaBaseUrl?: string;
  inline?: boolean;
  allowMath?: boolean;
  disableHtmlSanitization?: boolean;
}

export function render(markdown: string, opts: RenderOptions = {}): string {
  opts.mediaBaseUrl ??= opts.baseUrl;

  const marked_opts = {
    baseUrl: opts.baseUrl,
    gfm: true,
    renderer: new Renderer(),
    breaks: true,
  };

  const html = opts.inline
    ? Marked.marked.parseInline(markdown, marked_opts)
    : Marked.marked.parse(markdown, marked_opts);

  if (opts.disableHtmlSanitization) {
    return html;
  }

  let allowedTags = sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "video",
    "svg",
    "path",
    "circle",
    "figure",
    "figcaption",
    "del",
    "details",
    "summary",
    "iframe",
    "input",
  ]);
  if (opts.allowMath) {
    allowedTags = allowedTags.concat([
      "math",
      "maction",
      "annotation",
      "annotation-xml",
      "menclose",
      "merror",
      "mfenced",
      "mfrac",
      "mi",
      "mmultiscripts",
      "mn",
      "mo",
      "mover",
      "mpadded",
      "mphantom",
      "mprescripts",
      "mroot",
      "mrow",
      "ms",
      "semantics",
      "mspace",
      "msqrt",
      "mstyle",
      "msub",
      "msup",
      "msubsup",
      "mtable",
      "mtd",
      "mtext",
      "mtr",
    ]);
  }

  function transformMedia(tagName: string, attribs: sanitizeHtml.Attributes) {
    if (opts.mediaBaseUrl && attribs.src) {
      try {
        attribs.src = new URL(attribs.src, opts.mediaBaseUrl).href;
      } catch {
        delete attribs.src;
      }
    }
    return { tagName, attribs };
  }

  return sanitizeHtml(html, {
    allowedIframeDomains: ["youtu.be", "www.youtube.com", "ogp.deno.dev"],
    transformTags: {
      img: transformMedia,
      video: transformMedia,
    },
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "height", "width", "align"],
      video: [
        "src",
        "alt",
        "height",
        "width",
        "autoplay",
        "muted",
        "loop",
        "playsinline",
      ],
      a: ["id", "aria-hidden", "href", "tabindex", "rel", "target"],
      svg: ["viewbox", "width", "height", "aria-hidden", "background"],
      path: ["fill-rule", "d"],
      circle: ["cx", "cy", "r", "stroke", "stroke-width", "fill", "alpha"],
      span: opts.allowMath ? ["aria-hidden", "style"] : [],
      h1: ["id"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      h5: ["id"],
      h6: ["id"],
      //<iframe src="https://ogp.deno.dev/?size=large&url=https://github.com" height="500" style="width: 500px; max-width: 100%;"></iframe>
      iframe: ["src", "width", "height", "style"], // Only used when iframe tags are allowed in the first place.
      math: ["xmlns"], // Only enabled when math is enabled
      annotation: ["encoding"], // Only enabled when math is enabled
      input: ["type", "checked", "disabled"],
      code: ["class"],
    },
    allowedClasses: {
      div: ["highlight", "highlight-source-*", "notranslate"],
      span: [
        "token",
        "keyword",
        "operator",
        "number",
        "boolean",
        "function",
        "string",
        "comment",
        "class-name",
        "regex",
        "regex-delimiter",
        "tag",
        "attr-name",
        "punctuation",
        "script-punctuation",
        "script",
        "plain-text",
        "property",
        "prefix",
        "line",
        "deleted",
        "inserted",
      ],
      a: ["anchor"],
      svg: ["octicon", "octicon-link"],
    },
    allowProtocolRelative: false,
  });
}

function youtube(url: string) {
  let id: string | null = null;
  if (url.startsWith("https://www.youtube.com/watch")) {
    id = new URL(url).searchParams.get("v");
  } else if (url.startsWith("https://youtu.be/")) {
    id = new URL(url).pathname.substring(1);
  }
  if (id) {
    const embedUrl = new URL("https://www.youtube.com");
    embedUrl.pathname = `/embed/${id}`;
    const src = embedUrl.toString();
    return `<iframe width="560" height="315" src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  return null;
}
