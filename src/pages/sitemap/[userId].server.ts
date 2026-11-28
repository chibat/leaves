import { defineHandler } from "void";
import type { InferProps } from "void";
import { selectUserPostIds } from "~/server/db.ts";

export const loader = defineHandler(async (c) => {
  const userId = Number(c.req.param("userId"));
  const valid = Number.isSafeInteger(userId) && userId > 0;
  if (!valid) c.status(404);
  return { postIds: valid ? await selectUserPostIds(userId) : null };
});

export type Props = InferProps<typeof loader>;
