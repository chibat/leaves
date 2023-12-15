import { defineRoute } from "$fresh/server.ts";
import { selectPostsBySearchWord } from "~/server/db.ts";
import { getTitle } from "~/server/getTitle.ts";

export default defineRoute(async (req, _ctx) => {
  const searchWord = new URL(req.url).searchParams.get("q");
  if (!searchWord) {
    return Response.json([]);
  }
  const rows = await selectPostsBySearchWord({
    searchWord,
    postId: null,
    loginUserId: null,
  });
  const body = rows.map((row) => {
    return { value: row.id, name: "* " + getTitle(row.source) };
  });
  return Response.json(body);
});
