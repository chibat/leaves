import type { APIRoute } from "astro";
import { getTitle } from "~/server/getTitle.ts";
import { selectPostsBySearchWord } from "~/server/db.ts";

export const GET: APIRoute = async ({ request }) => {
  const searchWord = new URL(request.url).searchParams.get("q");
  if (!searchWord) return Response.json([]);
  const rows = await selectPostsBySearchWord({
    searchWord,
    postId: null,
    loginUserId: null,
  });
  return Response.json(
    rows.map((row) => ({ value: row.id, name: "* " + getTitle(row.source) })),
  );
};
