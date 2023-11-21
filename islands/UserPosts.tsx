import Posts from "~/components/Posts.tsx";
import { PAGE_ROWS } from "~/common/constants.ts";
import FollowingUsersModal from "~/components/FollowingUsersModal.tsx";
import FollowerUsersModal from "~/components/FollowerUsersModal.tsx";
import { ResponsePost } from "~/common/types.ts";

import { useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { trpc } from "~/client/trpc.ts";

export default function UserPosts(
  props: { pageUserId: number; loginUserId?: number },
) {
  const loginUserId = props.loginUserId;
  const userId = props.pageUserId;
  const allLoaded = useSignal(false);

  const posts = useSignal<Array<ResponsePost>>([]);
  const requesting = useSignal<boolean>(false);
  const spinning = useSignal<boolean>(true);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>("");
  const [followers, setFollowers] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>();
  const [followingModal, setFollowingModal] = useState<boolean>(false);
  const [followerModal, setFollowerModal] = useState<boolean>(false);

  useEffect(() => {
    trpc.getFollowInfo.query({ userId }).then((result) => {
      setFollowing(result.following);
      setFollowers(result.followers);
      setIsFollowing(result.isFollowing);
    });

    const io = new IntersectionObserver((entries) => {
      if (
        !allLoaded.value && !requesting.value &&
        entries[0].intersectionRatio !== 0
      ) {
        const postId = posts.value.length === 0
          ? undefined
          : posts.value[posts.value.length - 1].id;
        requesting.value = true;
        spinning.value = true;
        trpc.getPosts.query({ postId, userId }).then((results) => {
          console.log("###", results);
          if (results.length > 0) {
            posts.value = posts.value.concat(results);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.value = true;
          }
          requesting.value = false;
          spinning.value = false;
        });
      }
    });
    const bottom = document.getElementById("bottom");
    if (bottom) {
      io.observe(bottom);
    }
    return () => {
      if (bottom) {
        io.unobserve(bottom);
      }
    };
  }, []);

  async function follow() {
    setFollowLoading(true);
    await trpc.createFollow.mutate({ followingUserId: props.pageUserId });
    setFollowers((Number(followers) + 1).toString());
    setIsFollowing(!isFollowing);
    setFollowLoading(false);
  }

  async function unfollow() {
    setFollowLoading(true);
    await trpc.deleteFollow.mutate({ followingUserId: props.pageUserId });
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
      {(loginUserId && props.pageUserId !== loginUserId) &&
        (
          <>
            {isFollowing === false &&
              (
                <button
                  class="btn btn-secondary me-2 mb-2"
                  onClick={follow}
                  style={{ width: "150px" }}
                  disabled={followLoading}
                >
                  {followLoading &&
                    (
                      <div
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    )}
                  Follow
                </button>
              )}
            {isFollowing === true &&
              (
                <>
                  Following
                  <button
                    class="btn btn-danger ms-2 me-2 mb-2"
                    onClick={unfollow}
                    style={{ width: "150px" }}
                    disabled={followLoading}
                  >
                    {followLoading &&
                      (
                        <div
                          class="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      )}
                    Unfollow
                  </button>
                </>
              )}
          </>
        )}
      <div class="mb-3">
        {following &&
          (following === "0" ? <span class="me-3">0 Following</span> : (
            <a
              class="noDecoration me-3"
              onClick={displayFollowingUsers}
              style={{ cursor: "pointer" }}
            >
              {following} Following
            </a>
          ))}
        {followers &&
          (followers === "0" ? <span class="me-3">0 Followers</span> : (
            <a
              class="noDecoration me-3"
              onClick={displayFollowerUsers}
              style={{ cursor: "pointer" }}
            >
              {followers} Follower{followers === "1" ? "" : "s"}
            </a>
          ))}
        {(loginUserId && props.pageUserId === loginUserId) &&
          <a class="noDecoration" href="/likes">Likes</a>}
      </div>
      {followingModal &&
        <FollowingUsersModal userId={userId} setModal={setFollowingModal} />}
      {followerModal &&
        <FollowerUsersModal userId={userId} setModal={setFollowerModal} />}
      <Posts posts={posts} userId={loginUserId} />
      <br />
      <br />
      {spinning.value &&
        (
          <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      <div id="bottom">&nbsp;</div>
    </div>
  );
}
