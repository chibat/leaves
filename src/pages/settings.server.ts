import { defineHandler } from "void";
import type { InferProps } from "void";
import { deleteSession, deleteUser } from "~/server/db.ts";

export const loader = defineHandler((c) => {
  const session = c.get("leavesSession");
  if (!session) throw new Error("Missing session for protected page");
  return { userName: session.user.name };
});

export const actions = {
  deleteAccount: defineHandler(async (c) => {
    const session = c.get("leavesSession");
    if (!session) return c.redirect("/auth", 303);
    await deleteUser(session.user.id);
    await deleteSession(session);
    return c.redirect("/signout", 303);
  }),
};

export type Props = InferProps<typeof loader>;
