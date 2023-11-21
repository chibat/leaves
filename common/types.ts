export type ResponsePost = {
  id: number;
  user_id: number;
  source: string;
  updated_at: string;
  created_at: string;
  name?: string; // app_user
  picture?: string; // app_user
  comments: string; // comment
  likes: string; // likes
  draft: boolean;
  liked: boolean;
};
