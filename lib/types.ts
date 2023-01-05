import { Post } from "~/lib/db.ts";

export type ResponsePost = Post & { liked: boolean };
