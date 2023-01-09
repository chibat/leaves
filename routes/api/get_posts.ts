import { ResponsePost } from "~/lib/types.ts";
import {
  pool,
  Post,
  selectFollowingUsersPostByLtId,
  selectFollowingUsersPosts,
  selectLikes,
  selectPostByLtId,
  selectPosts,
  selectPostsBySearchWord,
  selectPostsBySearchWordAndLtId,
  selectUserPostByLtId,
  selectUserPosts,
} from "~/lib/db.ts";
import { Handlers } from "$fresh/server.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = {
  postId?: number;
  userId?: number;
  followig?: boolean;
  searchWord?: string;
};

export type ResponseType = Array<ResponsePost>;

async function execute(
  params: RequestType,
  request: Request,
): Promise<ResponseType> {
  const session = await getSession(request);

  const { posts, likedPostIds } = await pool(async (client) => {
    let posts: Post[] = [];
    if (params.userId) {
      // specified user only
      if (params.postId) {
        posts = await selectUserPostByLtId(client, {
          ltId: params.postId,
          userId: params.userId,
        });
      } else {
        posts = await selectUserPosts(client, params.userId);
      }
    } else if (params.followig && session) {
      // following user only
      const userId = session.user.id;
      if (params.postId) {
        posts = await selectFollowingUsersPostByLtId(client, {
          ltId: params.postId,
          userId,
        });
      } else {
        posts = await selectFollowingUsersPosts(client, userId);
      }
    } else if (params.searchWord) {
      if (params.postId) {
        posts = await selectPostsBySearchWordAndLtId(client, {
          searchWord: params.searchWord,
          postId: params.postId,
        });
      } else {
        posts = await selectPostsBySearchWord(client, params.searchWord);
      }
    } else {
      // all user
      if (params.postId) {
        posts = await selectPostByLtId(client, params.postId);
      } else {
        posts = await selectPosts(client);
      }
    }

    const likedPostIds = session
      ? await selectLikes(client, {
        userId: session.user.id,
        postIds: posts.map((post) => post.id),
      })
      : [];

    return { posts, likedPostIds };
  });

  return posts.map((p) => {
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
}

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const result: ResponseType = await execute(params, request);
    return Response.json(result);
  },
};
