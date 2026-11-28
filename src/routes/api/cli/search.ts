import { defineHandler } from "void";
import { getTitle } from "~/server/getTitle.ts";
import { selectPostsBySearchWord } from "~/server/db.ts";

export const GET = defineHandler(async (c) => {
  const searchWord = new URL(c.req.url).searchParams.get("q");
  if (!searchWord) return c.json([]);
  const rows = await selectPostsBySearchWord({
    searchWord,
    postId: null,
    loginUserId: null,
  });
  return c.json(
    rows.map((row) => ({ value: row.id, name: "* " + getTitle(row.source) })),
  );
});
