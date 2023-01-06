import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getSession } from "~/lib/auth.ts";
import { AppNotification, AppUser, selectNotificationsWithUpdate, transaction } from "~/lib/db.ts";
import Header from "~/islands/Header.tsx";

type PageType = {
  loginUser?: AppUser,
  notifications: AppNotification[],
}

export const handler: Handlers<PageType> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const notifications = await transaction(client => selectNotificationsWithUpdate(client, session.u.id));
    session.u.notification = false;
    const res = await ctx.render({ loginUser: session.u, notifications });
    return res;
  },
};

export default function Page(props: PageProps<PageType>) {
  return (
    <>
      <Head>
        <title>md-sns</title>
      </Head>
      <Header user={props.data.loginUser} />
      <main class="container">
        <h1>Notification</h1>
        {props.data.notifications.map(notification =>
          <div class="mb-1" key={notification.id}>
            <span class="me-3">{new Date(notification.created_at).toLocaleString()}</span>
            {notification.type === "follow" && <a href={`/users/${notification.action_user_id}`}><b>{notification.name}</b> followed you.</a>
            }
            {notification.type === "like" && <a href={`/posts/${notification.post_id}`}><b>{notification.name}</b> liked your post.</a>
            }
            {notification.type === "comment" && <a href={`/posts/${notification.post_id}`}><b>{notification.name}</b> commented on the post you are related to.</a>
            }
          </div>
        )}
        <br />
        <br />
      </main>
    </>
  );
}
