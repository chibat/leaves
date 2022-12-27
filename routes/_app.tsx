import { AppProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function App({ Component }: AppProps) {
  return (
    <>
      <Head>
        <title>md-sns</title>

        {/* needed for the dialog on safari to handle visibility of modal based on the `open` prop */}
        <link
          rel="stylesheet"
          href="https://esm.sh/dialog-polyfill@0.5.6/dialog-polyfill.css"
        />

        <link rel="stylesheet" href="/app.css" />
        <link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/base16/tomorrow-night.min.css" />
      </Head>
      <Component />
    </>
  );
}
