import { z } from "zod";
import { selectFollowingUsers } from "~/server/db.ts";
import { defaultString } from "~/common/utils.ts";
import { publicProcedure } from "~/plugins/trpc/context.ts";

export type User = { id: number; name: string; picture: string };

export default publicProcedure.input(
  z.object({ userId: z.number() }),
).query(async ({ input }) => {
  return (await selectFollowingUsers(input.userId)).map(
    (row) => {
      return {
        id: row.id,
        name: defaultString(row.name),
        picture: defaultString(row.picture),
      };
    },
  );
});
