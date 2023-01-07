import { UnknownPageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Header from "~/islands/Header.tsx";

export default function NotFoundPage({ url }: UnknownPageProps) {
  return (
    <>
      <Head>
        <title>Not Found - md-sns</title>
      </Head>
      <Header />
      <main class="container">
        404 Not Found
      </main>
    </>);
}
