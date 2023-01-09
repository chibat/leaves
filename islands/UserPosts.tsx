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
import { useSignal } from "@preact/signals";

export default function UserPosts(props: { pageUser: AppUser, loginUser?: AppUser }) {

  const loginUser = props.loginUser;
  const userId = props.pageUser.id;
  const allLoaded = useSignal(false);

  const posts = useSignal<Array<ResponsePost>>([]);
  const loading = useSignal<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>('0');
  const [followers, setFollowers] = useState<string>('0');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followingModal, setFollowingModal] = useState<boolean>(false);
  const [followerModal, setFollowerModal] = useState<boolean>(false);

  useEffect(() => {
    request<FollowInfoRequest, FollowInfoResponse>("get_follow_info", { userId }).then(result => {
      setFollowing(result.following);
      setFollowers(result.followers);
      setIsFollowing(result.isFollowing);
    });

    const io = new IntersectionObserver(entries => {
      if (!allLoaded.value && !loading.value && entries[0].intersectionRatio !== 0) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        loading.value = true;
        request<RequestType, ResponseType>("get_posts", { postId, userId }).then(results => {
          if (results.length > 0) {
            posts.value = posts.value.concat(results);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.value = true;
          }
          loading.value = false;
        });
      }
    });
    const bottom = document.getElementById("bottom");
    if (bottom) {
      io.observe(bottom);
    }
    return () => {
      if (bottom) {
        io.unobserve(bottom)
      }
    };
  }, []);

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

      {!loading.value &&
        <>
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
            {following === "0" ? <span class="me-3">0 Following</span> :
              <a class="noDecoration me-3" onClick={displayFollowingUsers} style={{ cursor: "pointer" }}>{following} Following</a>
            }
            {followers === "0" ? <span class="me-3">0 Followers</span> :
              <a class="noDecoration me-3" onClick={displayFollowerUsers} style={{ cursor: "pointer" }}>{followers} Follower{followers === "1" ? "" : "s"}</a>
            }
            {(loginUser && props.pageUser.id === loginUser.id) &&
              <a class="noDecoration" href="/likes">Likes</a>
            }
          </div>
        </>
      }
      {followingModal &&
        <FollowingUsersModal userId={userId} setModal={setFollowingModal} />
      }
      {followerModal &&
        <FollowerUsersModal userId={userId} setModal={setFollowerModal} />
      }
      <Posts posts={posts} user={loginUser} />
      <br />
      <br />
      {loading.value &&
        <div class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      <div id="bottom">&nbsp;</div>
    </div>
  );
}
