import type { Props } from "./notification.server.ts";
import { Link } from "@void/react";

export default function Notification({ notifications }: Props) {
  return (
    <>
      <title>Notification - Leaves</title>
      <main className="container">
        <h1>Notification</h1>
        {notifications.map((notification) => (
          <div className="mb-1" key={`${notification.type}-${notification.created_at}`}>
            <span className="me-3">
              {new Date(notification.created_at).toISOString()}
            </span>
            {notification.type === "follow" && (
              <Link href={`/users/${notification.action_user_id}`}>
                <b>{notification.action_user?.name}</b> followed you.
              </Link>
            )}
            {notification.type === "like" && (
              <Link href={`/posts/${notification.post_id}`}>
                <b>{notification.action_user?.name}</b> liked your post.
              </Link>
            )}
            {notification.type === "comment" && (
              <Link href={`/posts/${notification.post_id}`}>
                <b>{notification.action_user?.name}</b> commented on the post
                you are related to.
              </Link>
            )}
          </div>
        ))}
        <br />
        <br />
      </main>
    </>
  );
}
