import { z } from "zod";
import { selectFollowingUsers } from "~/server/db.ts";
import { defaultString } from "~/common/utils.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export type User = { id: number; name: string; picture: string };

export const getFollowingUsers = publicProcedure.input(
  z.object({ userId: z.number() }),
).query(async ({ input }) => {
  return (await selectFollowingUsers(input.userId)).data?.map(
    (row) => {
      return {
        id: row.user.id,
        name: defaultString(row.user.name),
        picture: defaultString(row.user.picture),
      };
    },
  );
});
