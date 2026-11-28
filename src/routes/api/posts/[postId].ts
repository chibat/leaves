import { defineHandler } from "void";
import { z } from "zod";
import { deletePost } from "~/server/db.ts";

const paramsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const DELETE = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await deletePost({ id: params.postId, userId: session.user.id });
    return { postId: params.postId };
  },
);
