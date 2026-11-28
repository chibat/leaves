import { defineHandler } from "void";
import { z } from "zod";
import { deleteComment } from "~/server/db.ts";

const paramsSchema = z.object({
  commentId: z.coerce.number().int().positive(),
});

export const DELETE = defineHandler.withValidator({ params: paramsSchema })(
  async (c, { params }) => {
    const session = c.get("leavesSession");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    await deleteComment({ id: params.commentId, userId: session.user.id });
    return {};
  },
);
