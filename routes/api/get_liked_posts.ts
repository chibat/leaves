import { getSession } from "~/lib/auth.ts";
import { ResponsePost } from "~/lib/types.ts";
import {
  pool,
  selectLikedPosts,
  selectLikedPostsByLtId,
  selectLikes,
} from "~/lib/db.ts";
import { Handlers } from "$fresh/server.ts";

export type RequestType = {
  postId?: number;
};

export type ResponseType = Array<ResponsePost>;

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();

    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }
    const user = session.user;

    const { posts, likedPostIds } = await pool(async (client) => {
      let posts;
      if (params.postId) {
        posts = await selectLikedPostsByLtId(client, {
          userId: user.id,
          ltId: params.postId,
        });
      } else {
        posts = await selectLikedPosts(client, user.id);
      }

      const likedPostIds = await selectLikes(client, {
        userId: user.id,
        postIds: posts.map((post) => post.id),
      });

      return { posts, likedPostIds };
    });

    const results = posts.map((p) => {
      return {
        id: p.id,
        user_id: p.user_id,
        source: p.source,
        updated_at: p.updated_at,
        created_at: p.created_at,
        comments: p.comments,
        name: p.name,
        picture: p.picture,
        likes: p.likes,
        liked: likedPostIds.includes(p.id),
      };
    });

    return Response.json(results);
  },
};
