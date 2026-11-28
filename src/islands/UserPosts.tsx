import Posts from "~/components/Posts.tsx";
import { PAGE_ROWS } from "~/common/constants.ts";
import FollowingUsersModal from "~/components/FollowingUsersModal.tsx";
import FollowerUsersModal from "~/components/FollowerUsersModal.tsx";

import { useEffect, useRef, useState } from "react";
import { api } from "~/client/api.ts";
import type { GetPostsOutput } from "~/common/types.ts";
import { Link } from "@void/react";

export default function UserPosts(
  props: {
    pageUserId: number;
    loginUserId?: number;
    initialPosts?: GetPostsOutput[];
  },
) {
  const loginUserId = props.loginUserId;
  const userId = props.pageUserId;
  const [posts, setPosts] = useState<GetPostsOutput[]>(
    props.initialPosts ?? [],
  );
  const [spinning, setSpinning] = useState(props.initialPosts === undefined);
  const postsRef = useRef(posts);
  const allLoaded = useRef(
    props.initialPosts !== undefined && props.initialPosts.length < PAGE_ROWS,
  );

  const requesting = useRef(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [following, setFollowing] = useState<string>("");
  const [followers, setFollowers] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>();
  const [followingModal, setFollowingModal] = useState<boolean>(false);
  const [followerModal, setFollowerModal] = useState<boolean>(false);

  useEffect(() => {
    const initialPosts = props.initialPosts ?? [];
    postsRef.current = initialPosts;
    setPosts(initialPosts);
    setSpinning(props.initialPosts === undefined);
    allLoaded.current = props.initialPosts !== undefined &&
      props.initialPosts.length < PAGE_ROWS;
    requesting.current = false;
    setFollowing("");
    setFollowers("");
    setIsFollowing(undefined);

    api.getFollowInfo({ userId }).then((result) => {
      setFollowing(result.following);
      setFollowers(result.followers);
      setIsFollowing(result.isFollowing);
    });
  }, [props.initialPosts, userId]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (
        !allLoaded.current && !requesting.current &&
        entries[0].intersectionRatio !== 0
      ) {
        const postId = postsRef.current.at(-1)?.id ?? null;
        requesting.current = true;
        setSpinning(true);
        api.getPosts({ postId, userId }).then((results) => {
          if (results.length > 0) {
            const nextPosts = postsRef.current.concat(results);
            postsRef.current = nextPosts;
            setPosts(nextPosts);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.current = true;
          }
        }).finally(() => {
          requesting.current = false;
          setSpinning(false);
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
  }, [userId]);

  async function follow() {
    setFollowLoading(true);
    await api.createFollow({ followingUserId: props.pageUserId });
    setFollowers((Number(followers) + 1).toString());
    setIsFollowing(!isFollowing);
    setFollowLoading(false);
  }

  async function unfollow() {
    setFollowLoading(true);
    await api.deleteFollow({ followingUserId: props.pageUserId });
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
                  className="btn btn-secondary me-2 mb-2"
                  onClick={follow}
                  style={{ width: "150px" }}
                  disabled={followLoading}
                >
                  {followLoading &&
                    (
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
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
                    className="btn btn-danger ms-2 me-2 mb-2"
                    onClick={unfollow}
                    style={{ width: "150px" }}
                    disabled={followLoading}
                  >
                    {followLoading &&
                      (
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      )}
                    Unfollow
                  </button>
                </>
              )}
          </>
        )}
      <div className="mb-3">
        {following &&
          (following === "0" ? <span className="me-3">0 Following</span> : (
            <a
              className="noDecoration me-3"
              onClick={displayFollowingUsers}
              style={{ cursor: "pointer" }}
            >
              {following} Following
            </a>
          ))}
        {followers &&
          (followers === "0" ? <span className="me-3">0 Followers</span> : (
            <a
              className="noDecoration me-3"
              onClick={displayFollowerUsers}
              style={{ cursor: "pointer" }}
            >
              {followers} Follower{followers === "1" ? "" : "s"}
            </a>
          ))}
        {(loginUserId && props.pageUserId === loginUserId) &&
          <Link className="noDecoration" href="/likes">Likes</Link>}
      </div>
      {followingModal &&
        <FollowingUsersModal userId={userId} setModal={setFollowingModal} />}
      {followerModal &&
        <FollowerUsersModal userId={userId} setModal={setFollowerModal} />}
      <Posts posts={posts} userId={loginUserId} />
      <br />
      <br />
      {spinning &&
        (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      <div id="bottom">&nbsp;</div>
    </div>
  );
}
