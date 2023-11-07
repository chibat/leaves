import { defineRoute } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/server/auth.ts";
import Header from "~/islands/Header.tsx";
import DeleteAccount from "~/islands/DeleteAccount.tsx";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  if (!session) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  const authUrl = getAuthUrl(req.url);
  return (
    <>
      <Header user={session.user} authUrl={authUrl} />
      <main class="container">
        <h1>Settings</h1>
        {
          /* <h2>Name</h2>
        TODO: move to islands
        <input class="form-control" type="text" value={session.user.name} />
        <button class="btn btn-primary mt-3" type="submit">Save</button> */
        }
        <DeleteAccount userName={session.user.name} />
      </main>
    </>
  );
});
