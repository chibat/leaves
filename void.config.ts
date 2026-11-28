import { defineConfig } from "void/config";

export default defineConfig({
  sourceDir: "src",
  target: "cloudflare",
  inference: {
    appType: "void",
  },
  worker: {
    compatibility_date: "2026-10-10",
    compatibility_flags: ["nodejs_compat"],
  },
  cloudflare: {
    name: "leaves",
  },
  head: {
    htmlAttrs: { lang: "en" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1fbc92" },
      {
        property: "og:image",
        content: "https://leaves.chiba.dev/assets/img/og.png",
      },
    ],
    link: [
      {
        href: "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
        rel: "stylesheet",
        integrity:
          "sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65",
        crossorigin: "anonymous",
      },
      {
        href:
          "//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/github.min.css",
        rel: "stylesheet",
      },
      { href: "/app.css", rel: "stylesheet" },
      { href: "/manifest.json", rel: "manifest" },
    ],
    script: [
      {
        src: "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
        integrity:
          "sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4",
        crossorigin: "anonymous",
        defer: "true",
      },
      { src: "/register_sw.js", async: "true" },
    ],
  },
});
