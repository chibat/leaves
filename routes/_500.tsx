import { ErrorPageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function Error500Page({ error }: ErrorPageProps) {
  return <>
    <Head>
      <title>500 Internal Server Error - md-sns</title>
    </Head>
    <main class="container">
      500 Internal Server Error: {(error as Error).message}
    </main>
  </>
}
