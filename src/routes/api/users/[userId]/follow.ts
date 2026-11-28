import { defineHandler } from "void";
import { z } from "zod";
import { deleteFollow, insertFollow } from "~/server/db.ts";
import { getFollowInfo } from "~/server/queries.ts";

const paramsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  (c, { params }) => getFollowInfo(c.get("leavesSession"), params.userId),
);

export const POST = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await insertFollow({
      userId: session.user.id,
      followingUserId: params.userId,
    });
    return {};
  },
);

export const DELETE = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await deleteFollow({
      userId: session.user.id,
      followingUserId: params.userId,
    });
    return {};
  },
);
