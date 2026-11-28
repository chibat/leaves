import { defineHandler } from "void";
import { z } from "zod";
import { insertComment } from "~/server/db.ts";
import { getComments } from "~/server/queries.ts";

const paramsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  (_c, { params }) => getComments(params.postId),
);

export const POST = defineHandler.withValidator({
  params: paramsSchema,
  body: z.object({ source: z.string().max(5000) }),
})(async (c, { params, body }) => {
  const session = c.get("leavesSession");
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  await insertComment({
    postId: params.postId,
    userId: session.user.id,
    source: body.source,
  });
  return {};
});
