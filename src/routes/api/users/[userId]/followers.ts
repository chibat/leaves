import { defineHandler } from "void";
import { z } from "zod";
import { getFollowerUsers } from "~/server/queries.ts";

const paramsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const GET = defineHandler.withValidator({ params: paramsSchema })(
  (_c, { params }) => getFollowerUsers(params.userId),
);
