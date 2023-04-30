import { Post } from "~/server/db.ts";

export type ResponsePost = Post & { liked: boolean };
