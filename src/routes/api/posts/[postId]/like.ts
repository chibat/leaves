import { defineHandler } from "void";
import { z } from "zod";
import { deleteLike, insertLike } from "~/server/db.ts";
import { isLiked } from "~/server/queries.ts";

const paramsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    return { liked: await isLiked(session.user.id, params.postId) };
  },
);

export const POST = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await insertLike({ userId: session.user.id, postId: params.postId });
    return {};
  },
);

export const DELETE = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await deleteLike({ userId: session.user.id, postId: params.postId });
    return {};
  },
);
