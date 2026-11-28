import DeleteAccount from "~/islands/DeleteAccount.tsx";
import type { Props } from "./settings.server.ts";

export default function Settings({ userName }: Props) {
  return (
    <>
      <title>Settings - Leaves</title>
      <meta property="og:url" content="https://leaves.chiba.dev/" />
      <meta property="og:title" content="Leaves" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@tomofummy" />
      <meta name="twitter:creator" content="@tomofummy" />
      <meta
        name="twitter:image"
        content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
      />
      <main className="container">
        <h1>
          <img
            src="/assets/img/gear-fill.svg"
            alt="Likes"
            width="32"
            height="32"
            className="me-2"
          />
          Settings
        </h1>
        <DeleteAccount userName={userName} />
      </main>
    </>
  );
}
