import type { Props } from "./index.server.ts";
import { Link } from "@void/react";

export default function SitemapUsers({ users }: Props) {
  return (
    <>
      <title>Sitemap Users - Leaves</title>
      <main className="container" style={{ wordBreak: "break-word" }}>
        <h1>Sitemap Users</h1>
        {users.map((user) => (
          <span key={user.user_id}>
            <Link href={`/sitemap/${user.user_id}`}>{user.user_id}</Link>&nbsp;
          </span>
        ))}
      </main>
    </>
  );
}
