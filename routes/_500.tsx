import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function Error500Page({ error }: PageProps) {
  return (
    <>
      <Head>
        <title>500 Internal Server Error - Leaves</title>
      </Head>
      <main class="container">
        500 Internal Server Error: {(error as Error).message}
      </main>
    </>
  );
}
