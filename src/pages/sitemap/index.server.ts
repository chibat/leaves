import { defineHandler } from "void";
import type { InferProps } from "void";
import { selectUsers } from "~/server/db.ts";

export const loader = defineHandler(async () => ({
  users: await selectUsers(),
}));

export type Props = InferProps<typeof loader>;
