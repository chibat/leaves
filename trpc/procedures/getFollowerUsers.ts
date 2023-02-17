import { z } from "zod";
import { pool, selectFollowerUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";

import { publicProcedure } from "~/trpc/context.ts";

export type User = { id: number; name: string; picture: string };

export const getFollowerUsers = publicProcedure.input(
  z.object({ userId: z.number() }),
).query(async ({ input }) => {
  const users = await pool((client) =>
    selectFollowerUsers(client, input.userId)
  );
  return users.map(
    (appUser) => {
      return {
        id: appUser.id,
        name: defaultString(appUser.name),
        picture: defaultString(appUser.picture),
      } as User;
    },
  );
});
