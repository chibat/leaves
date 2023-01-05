import Posts from '~/components/Posts.tsx'
import { request } from '~/lib/request.ts';
import { PAGE_ROWS } from '~/lib/constants.ts';
import FollowingUsersModal from '~/components/FollowingUsersModal.tsx'
import FollowerUsersModal from '~/components/FollowerUsersModal.tsx'
import { ResponsePost } from "~/lib/types.ts";
import { AppUser } from "~/lib/db.ts";

import type { RequestType, ResponseType } from "~/routes/api/get_posts.ts";
import type { RequestType as FollowInfoRequest, ResponseType as FollowInfoResponse } from "~/routes/api/get_follow_info.ts";
import type { RequestType as FollowRequest, ResponseType as FollowResponse } from "~/routes/api/create_follow.ts";
import type { RequestType as UnfollowRequest, ResponseType as UnfollowResponse } from "~/routes/api/delete_follow.ts";
import { useEffect, useState } from "preact/hooks";

export default function UserPosts(props: { pageUser: AppUser, loginUser?: AppUser }) {

  const loginUser = props.loginUser;
  const userId = props.pageUser.id;
  console.debug("start ", userId);

  const [posts, setPosts] = useState<Array<ResponsePost>>([]);
  const [previousButton, setPreviousButton] = useState<boolean>(false);
  const [nextButton, setNextButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>('0');
  const [followers, setFollowers] = useState<string>('0');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followingModal, setFollowingModal] = useState<boolean>(false);
  const [followerModal, setFollowerModal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await request<FollowInfoRequest, FollowInfoResponse>("get_follow_info", { userId });
      setFollowing(result.following);
      setFollowers(result.followers);
      setIsFollowing(result.isFollowing);
      const results = await request<RequestType, ResponseType>("get_posts", { userId });
      console.log(results);
      setPosts(results);
      if (results.length < PAGE_ROWS) {
        setPreviousButton(false);
        setNextButton(false);
      } else {
        setNextButton(true);
      }
      setLoading(false);
    })();
  }, []);

  async function previous() {
    setLoading(true);
    const postId = posts[0].id;
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "previous" });
    if (results.length > 0) {
      setPosts(results);
      setNextButton(true);
    }

    if (results.length < PAGE_ROWS) {
      setPreviousButton(false);
    }
    setLoading(false);
  }

  async function next() {
    setLoading(true);
    const postId = posts[posts.length - 1].id;
    const results = await request<RequestType, ResponseType>("get_posts", { postId, userId, direction: "next" });
    if (results.length > 0) {
      setPosts(results);
      setPreviousButton(true);
    }

    if (results.length < PAGE_ROWS) {
      setNextButton(false);
    }
    setLoading(false);
  }

  async function follow() {
    setFollowLoading(true);
    await request<FollowRequest, FollowResponse>("create_follow", { followingUserId: props.pageUser.id });
    setFollowers((Number(followers) + 1).toString());
    setIsFollowing(!isFollowing);
    setFollowLoading(false);
  }

  async function unfollow() {
    setFollowLoading(true);
    await request<UnfollowRequest, UnfollowResponse>("delete_follow", { followingUserId: props.pageUser.id, });
    const _followers = Number(followers) - 1;
    setFollowers((_followers < 0 ? 0 : _followers).toString());
    setIsFollowing(!isFollowing);
    setFollowLoading(false);
  }

  function displayFollowingUsers() {
    setFollowingModal(true);
  }

  function displayFollowerUsers() {
    setFollowerModal(true);
  }

  return (
    <div>
      {loading &&
        <div class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      {!loading &&
        <>
          <h1><img src={props.pageUser.picture} class="img-thumbnail" alt="" /> {props.pageUser.name}</h1>
          {(loginUser && props.pageUser.id !== loginUser.id) &&
            <>
              {!isFollowing &&
                <button class="btn btn-secondary me-2 mb-2" onClick={follow} style={{ width: "150px" }} disabled={followLoading}>
                  {followLoading &&
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  }
                  Follow
                </button>
              }
              {isFollowing &&
                <>
                  Following
                  <button class="btn btn-danger ms-2 me-2 mb-2" onClick={unfollow} style={{ width: "150px" }} disabled={followLoading}>
                    {followLoading &&
                      <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    }
                    Unfollow
                  </button>
                </>
              }
            </>
          }
          <div class="mb-3">
            <a class="noDecoration me-3" onClick={displayFollowingUsers} style={{ cursor: "pointer" }}>{following} Following</a>
            <a class="noDecoration me-3" onClick={displayFollowerUsers} style={{ cursor: "pointer" }}>{followers} Follower{followers === "1" ? "" : "s"}</a>
            {(loginUser && props.pageUser.id === loginUser.id) &&
              <a class="noDecoration" href="/likes">Likes</a>
            }
          </div>
          <Posts posts={posts} setPosts={setPosts} />
          {previousButton &&
            <button class="btn btn-secondary me-2" onClick={previous} style={{ width: "150px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left me-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              Previous
            </button>
          }
          {nextButton &&
            <button class="btn btn-secondary" onClick={next} style={{ width: "150px" }}>
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right ms-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          }
          <br />
          <br />
        </>
      }
      {followingModal &&
        <FollowingUsersModal userId={userId} setModal={setFollowingModal} />
      }
      {followerModal &&
        <FollowerUsersModal userId={userId} setModal={setFollowerModal} />
      }
    </div>
  );
}
