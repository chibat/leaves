import { defineRoute } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getSession } from "~/server/auth.ts";
import { selectNotificationsWithUpdate } from "~/server/db.ts";
import Header from "~/islands/Header.tsx";

export default defineRoute(async (req, _ctx) => {
  const session = await getSession(req);
  if (!session) {
    return new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
  }
  const notifications = await selectNotificationsWithUpdate(session.user.id);
  let locale: Intl.Locale;
  try {
    locale = new Intl.Locale(req.headers.get("accept-language")?.split(",").at(0) ?? "en");
  } catch (error) {
    locale = new Intl.Locale("en");
  }
  return (
    <>
      <Head>
        <title>Notification - Leaves</title>
      </Head>
      <Header user={session.user} />
      <main class="container">
        <h1>Notification</h1>
        {notifications.map(notification =>
          <div class="mb-1" key={notification.id}>
            <span class="me-3">{new Date(notification.created_at).toLocaleString(locale)}</span>
            {notification.type === "follow" && <a href={`/users/${notification.action_user_id}`}><b>{notification.action_user?.name}</b> followed you.</a>
            }
            {notification.type === "like" && <a href={`/posts/${notification.post_id}`}><b>{notification.action_user?.name}</b> liked your post.</a>
            }
            {notification.type === "comment" && <a href={`/posts/${notification.post_id}`}><b>{notification.action_user?.name}</b> commented on the post you are related to.</a>
            }
          </div>
        )}
        <br />
        <br />
      </main>
    </>
  );
});
