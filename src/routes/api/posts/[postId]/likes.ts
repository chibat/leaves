import { defineHandler } from "void";
import { z } from "zod";
import { getLikeUsers } from "~/server/queries.ts";

const paramsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  (_c, { params }) => getLikeUsers(params.postId),
);
