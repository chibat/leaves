import { defineHandler } from "void";
import { z } from "zod";
import { getFollowingUsers } from "~/server/queries.ts";

const paramsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  (_c, { params }) => getFollowingUsers(params.userId),
);
