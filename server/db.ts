import { createClient, SupabaseClient } from "supabase-js";
import * as uuid from "$std/uuid/mod.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import * as env from "~/server/env.ts";
import { Database } from "~/server/database.types.ts";

export type AppUser = Database["public"]["Tables"]["app_user"]["Row"];
export type PostViewTypeA = Database["public"]["Views"]["post_view"]["Row"];

// View の型定義の自動生成はフィールドが全部 null 許可になってしまうので明示的に定義
export type PostViewType = {
  comments: number;
  created_at: string;
  draft: boolean;
  id: number;
  likes: number;
  name: string;
  picture: string | null;
  source: string;
  updated_at: string;
  user_id: number;
};

export type UserViewType = {
  user_id: number;
  updated_at: string;
};

let supabase: SupabaseClient<Database>;

export function initSupabase() {
  const url = "https://" + env.get("SUPABASE_HOST");
  const serviceRoleKey = env.get("SUPABASE_SERVICE_ROLE_KEY");
  supabase = createClient<Database>(url, serviceRoleKey);
}

export async function selectUserByGoogleId(googleId: string) {
  const { data, error } = await supabase.from("app_user").select(
    "id,name,picture",
  ).eq(
    "google_id",
    googleId,
  ).maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function upsertUser(
  params: { googleId: string; name: string; picture: string },
) {
  const { data, error } = await supabase.from("app_user").upsert({
    google_id: params.googleId,
    name: params.name,
    picture: params.picture,
  }, { onConflict: "google_id" }).select("id,google_id,name,picture")
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data!;
}

export async function deleteUser(
  userId: number,
) {
  const { error } = await supabase.from("app_user").delete().eq("id", userId);
  if (error) {
    throw error;
  }
}

export async function selectUser(userId: number) {
  const { data, error } = await supabase.from("app_user").select(
    "id,name,picture,notification",
  ).eq(
    "id",
    userId,
  )
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function selectUsers() {
  const { data, error } = await supabase.from("user_view").select(
    "user_id,updated_at",
  ).returns<UserViewType[]>();
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function insertPost(
  params: { userId: number; source: string; draft: boolean },
) {
  const { data, error } = await supabase.from("post").insert({
    user_id: params.userId,
    source: params.source,
    draft: params.draft,
  }).select("id").maybeSingle();
  if (error) {
    throw error;
  }
  return data?.id!;
}

export async function updatePost(
  params: { postId: number; userId: number; source: string; draft: boolean },
) {
  const { error } = await supabase.from("post")
    .update({
      id: params.postId,
      source: params.source,
      draft: params.draft,
      updated_at: new Date().toISOString(),
    }).match({ "id": params.postId, "user_id": params.userId });
  if (error) {
    throw error;
  }
}

export async function deletePost(
  params: { id: number; userId: number },
) {
  const { error } = await supabase.from("post").delete().match({
    "id": params.id,
    "user_id": params.userId,
  });
  if (error) {
    throw error;
  }
}

export async function selectPost(id: number) {
  const { data, error } = await supabase.from("post_view").select("*").eq(
    "id",
    id,
  )
    .returns<PostViewType[]>()
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function selectPostIds() {
  const { data, error } = await supabase.from("post").select("id,updated_at")
    .eq(
      "draft",
      false,
    ).order(
      "id",
      { ascending: false },
    ).limit(1000);
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function selectPosts(ltId: number | null) {
  const builder = supabase.from("post_view").select("*").eq("draft", false);
  if (ltId) {
    builder.lt("id", ltId);
  }
  const { data, error } = await builder.order("id", { ascending: false }).limit(
    PAGE_ROWS,
  ).returns<PostViewType[]>();
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function selectUserPost(
  params: { userId: number; self: boolean; ltId: number | null },
) {
  const builder = supabase.from("post_view").select("*").eq(
    "user_id",
    params.userId,
  );
  if (!params.self) {
    builder.eq("draft", false);
  }
  if (params.ltId) {
    builder.lt("id", params.ltId);
  }
  const { data, error } = await builder.order("id", { ascending: false }).limit(
    PAGE_ROWS,
  ).returns<PostViewType[]>();
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function selectUserPostIds(userId: number) {
  const { data, error } = await supabase.from("post").select("id").eq(
    "user_id",
    userId,
  ).eq(
    "draft",
    false,
  ).order(
    "id",
    { ascending: false },
  ).limit(1000);
  if (error) {
    throw error;
  }
  return data.map((row) => row.id) ?? [];
}

export async function selectFollowingUsersPosts(
  params: { userId: number; ltId: number | null },
) {
  const { data, error } = await supabase.rpc("select_following_users_posts", {
    login_user_id: params.userId,
    post_id: params.ltId!,
  });
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function selectLikedPosts(
  params: { userId: number; ltId: number | null },
) {
  const { data, error } = await supabase.rpc("select_liked_posts", {
    login_user_id: params.userId,
    post_id: params.ltId!,
  });
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function selectPostsBySearchWord(
  params: {
    searchWord: string;
    postId: number | null;
    loginUserId: number | null;
  },
) {
  const searchWord = params.searchWord.trim();
  if (searchWord.trim().length === 0) {
    return [];
  }
  const { data, error } = await supabase.rpc("select_posts_by_word", {
    search_word: searchWord,
    login_user_id: params.loginUserId!,
    post_id: params.postId!,
  });
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function insertComment(
  params: { postId: number; userId: number; source: string },
) {
  const { error } = await supabase.from("comment").insert({
    "post_id": params.postId,
    "user_id": params.userId,
    "source": params.source,
  });
  if (error) {
    throw error;
  }

  supabase.rpc("insert_notification_for_comment", {
    p_post_id: params.postId,
    p_user_id: params.userId,
  }).then(({ error }) => {
    if (error) {
      console.error(error);
    }
  });
}

export async function selectComments(
  postId: number,
) {
  const { data, error } = await supabase.from("comment").select(
    "id,user_id,source,updated_at,app_user(name,picture)",
  ).eq("post_id", postId).order("id").limit(100);
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function deleteComment(params: { id: number; userId: number }) {
  const { error } = await supabase.from("comment").delete().match({
    id: params.id,
    user_id: params.userId,
  });
  if (error) {
    throw error;
  }
}

export async function insertFollow(
  params: { userId: number; followingUserId: number },
) {
  const { error } = await supabase.from("follow").insert({
    "user_id": params.userId,
    "following_user_id": params.followingUserId,
  });
  if (error) {
    throw error;
  }

  supabase.from("notification").insert({
    "user_id": params.followingUserId,
    "type": "follow",
    action_user_id: params.userId,
  }).then((error) => {
    if (error) {
      console.error(error);
    } else {
      supabase.from("app_user").update({ notification: true }).eq(
        "id",
        params.followingUserId,
      ).then(({ error }) => {
        if (error) {
          console.error(error);
        }
      });
    }
  });
}

export async function deleteFollow(
  params: { userId: number; followingUserId: number },
) {
  const { error } = await supabase.from("follow").delete().match({
    "user_id": params.userId,
    "following_user_id": params.followingUserId,
  });
  if (error) {
    throw error;
  }
}

export async function selectFollowingUsers(userId: number) {
  const { data, error } = await supabase.from("follow").select(
    "user:following_user_id(id,name,picture)",
  ).eq(
    "user_id",
    userId,
  )
    .order("created_at", { ascending: false }).returns<
    { user: { id: number; name: string; picture: string } }[]
  >();
  if (error) {
    throw error;
  }
  return data!.map((row) => row.user);
}

export async function selectFollowerUsers(followingUserId: number) {
  const { data, error } = await supabase.from("follow").select(
    "user:user_id(id,name,picture)",
  )
    .eq(
      "following_user_id",
      followingUserId,
    )
    .order("created_at", { ascending: false }).returns<
    { user: { id: number; name: string; picture: string } }[]
  >();
  if (error) {
    throw error;
  }
  return data!.map((row) => row.user);
}

export async function selectCountFollowing(userId: number) {
  const { count, error } = await supabase.from("follow").select("user_id", {
    count: "exact",
  }).eq("user_id", userId);
  if (error) {
    throw error;
  }
  return "" + count;
}

export async function selectCountFollower(followingUserId: number) {
  const { count, error } = await supabase.from("follow").select("user_id", {
    count: "exact",
  }).eq("following_user_id", followingUserId);
  if (error) {
    throw error;
  }
  return "" + count;
}

export async function judgeFollowing(
  params: { userId: number; followingUserId: number },
) {
  const { data, error } = await supabase.from("follow").select("user_id").match(
    {
      "user_id": params.userId,
      "following_user_id": params.followingUserId,
    },
  );
  if (error) {
    throw error;
  }
  return data?.length === 1;
}

export async function selectNotificationsWithUpdate(userId: number) {
  const { data, error } = await supabase.from("notification").select(
    "id,type,action_user_id,post_id,created_at,action_user:action_user_id(name)",
  ).eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
    .returns<
      {
        id: number;
        type: string;
        post_id: number;
        action_user_id: number;
        created_at: string;
        action_user: { name: string };
      }[]
    >();
  if (error) {
    throw error;
  }

  supabase.from("app_user").update({ "notification": false }).eq(
    "id",
    userId,
  ).then(({ error }) => {
    if (error) {
      console.error(error);
    }
  });

  return data ?? [];
}

export async function insertLike(
  params: { userId: number; postId: number },
) {
  const { error } = await supabase.from("likes").insert({
    "user_id": params.userId,
    "post_id": params.postId,
  });
  if (error) {
    throw error;
  }

  supabase.rpc("insert_notification_for_like", {
    p_post_id: params.postId,
    p_user_id: params.userId,
  }).then(({ error }) => {
    if (error) {
      console.error(error);
    }
  });
}

export async function deleteLike(params: { userId: number; postId: number }) {
  const { error } = await supabase.from("likes").delete().match({
    "post_id": params.postId,
    "user_id": params.userId,
  });
  if (error) {
    throw error;
  }
}

export async function selectLikes(
  { userId, postIds }: { userId: number; postIds: number[] },
) {
  const { data, error } = await supabase.from("likes").select("post_id").eq(
    "user_id",
    userId,
  ).in("post_id", postIds);
  if (error) {
    throw error;
  }
  return data?.map((row) => row.post_id) ?? [];
}

export async function selectLikeUsers(postId: number) {
  const { data, error } = await supabase.from("likes").select(
    "app_user(id,name,picture)",
  ).eq(
    "post_id",
    postId,
  ).order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }
  return data.map((row) => row.app_user!);
}

export async function selectSession(sessionId: string) {
  if (!uuid.validate(sessionId)) {
    return undefined;
  }
  const { data, error } = await supabase.from("app_session").select(
    "app_user(id,name,picture,notification)",
  ).eq(
    "id",
    sessionId,
  ).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return undefined;
  }
  return data.app_user;
}

export async function insertSession(userId: number) {
  const { data, error } = await supabase.from("app_session").insert({
    user_id: userId,
  })
    .select("id").maybeSingle();
  if (error) {
    throw error;
  }
  const sessionId = data?.id;
  deleteExpiredSession(userId);
  return sessionId!;
}

export async function deleteSession(
  session: { id: string; user: { id: number } },
) {
  const { error } = await supabase.from("app_session").delete().match({
    id: session.id,
  });
  if (error) {
    throw error;
  }
  deleteExpiredSession(session.user.id);
}

/**
 * 作成後、1ヶ月経過しているセッションを削除する
 * TODO セッション取得時に updated_at を更新するか？
 *
 * @param userId
 */
function deleteExpiredSession(userId: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  supabase.from("app_session").delete().eq("user_id", userId).lt(
    "updated_at",
    date.toISOString(),
  ).then(({ error }) => {
    if (error) {
      console.error(error);
    }
  });
}
