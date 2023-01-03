import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import { AppUser } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";

export default function Page(props: PageProps<{ user?: AppUser, authUrl: string }>) {
  const user = props.data.user;
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={user} authUrl={props.data.authUrl} />
      <div class="p-4 mx-auto max-w-screen-md">
        edit
      </div>
    </>
  );
}
