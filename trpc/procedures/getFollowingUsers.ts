import { z } from "zod";
import { pool, selectFollowingUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";
import { publicProcedure } from "~/trpc/context.ts";

export type User = { id: number; name: string; picture: string };

export const getFollowingUsers = publicProcedure.input(
  z.object({ userId: z.number() }),
).query(async ({ input }) => {
  return (await pool((client) => selectFollowingUsers(client, input.userId)))
    .map(
      (appUser) => {
        return {
          id: appUser.id,
          name: defaultString(appUser.name),
          picture: defaultString(appUser.picture),
        } as User;
      },
    );
});
