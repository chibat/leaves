import { z } from "zod";
import { selectLikeUsers } from "~/server/db.ts";
import { defaultString } from "~/common/utils.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export type User = { id: number; name: string; picture: string };

export const getLikeUsers = publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input }) => {
  return (await selectLikeUsers(input.postId)).map(
    (appUser) => {
      return {
        id: appUser.id,
        name: defaultString(appUser.name),
        picture: defaultString(appUser.picture),
      } as User;
    },
  );
});
