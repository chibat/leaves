import { PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1fbc92" />
        <meta
          property="og:image"
          content="https://leaves.chiba.dev/assets/img/og.png"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/base16/tomorrow-night.min.css"
        />
        <link rel="stylesheet" href="/app.css" />
        <link rel="manifest" href="/manifest.json" />
        <script async src="/register_sw.js" />
        {
          /*
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SZVLRW13Y8"
        >
        </script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-SZVLRW13Y8');
        </script> */
        }
      </head>
      <body>
        <Component />
        <footer class="container d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
          <p class="col-md-4 mb-0 text-muted">
            &copy;<a
              href="https://chiba.dev"
              target="_blank"
              class="doc text-muted"
            >
              chibat
            </a>
          </p>
          <ul class="nav col-md-4 justify-content-end">
            <li class="nav-item">
              <a href="/" class="nav-link px-2 text-muted">Home</a>
            </li>
            <li class="nav-item">
              <a href="/about" class="nav-link px-2 text-muted">About</a>
            </li>
            <li class="nav-item">
              <a href="/sitemap" class="nav-link px-2 text-muted">Sitemap</a>
            </li>
          </ul>
        </footer>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4"
          crossOrigin="anonymous"
        >
        </script>
      </body>
    </html>
  );
}
