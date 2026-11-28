import { defineHandler } from "void";
import type { InferProps } from "void";
import { selectNotificationsWithUpdate } from "~/server/db.ts";

export const loader = defineHandler(async (c) => {
  const session = c.get("leavesSession");
  if (!session) throw new Error("Missing session for protected page");
  return {
    notifications: await selectNotificationsWithUpdate(session.user.id),
  };
});

export type Props = InferProps<typeof loader>;
