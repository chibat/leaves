import { useEffect, useRef, useState } from "react";
import Posts from "~/components/Posts.tsx";
import { PAGE_ROWS } from "~/common/constants.ts";
import { api } from "~/client/api.ts";
import type { GetPostsOutput } from "~/common/types.ts";

export default function LikePosts(
  props: { loginUserId?: number; initialPosts?: GetPostsOutput[] },
) {
  const [posts, setPosts] = useState<GetPostsOutput[]>(
    props.initialPosts ?? [],
  );
  const [spinning, setSpinning] = useState(props.initialPosts === undefined);
  const postsRef = useRef(posts);
  const requesting = useRef(false);
  const allLoaded = useRef(
    props.initialPosts !== undefined && props.initialPosts.length < PAGE_ROWS,
  );

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (
        requesting.current || allLoaded.current ||
        entries[0].intersectionRatio === 0
      ) {
        return;
      }
      requesting.current = true;
      setSpinning(true);
      void (async () => {
        try {
          const lastPost = postsRef.current.at(-1);
          const results = await api.getLikedPosts({
            postId: lastPost?.id ?? null,
          });
          if (results.length > 0) {
            const nextPosts = postsRef.current.concat(results);
            postsRef.current = nextPosts;
            setPosts(nextPosts);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.current = true;
          }
        } finally {
          requesting.current = false;
          setSpinning(false);
        }
      })();
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

  return (
    <div>
      <h1>
        <img
          src="/assets/img/heart-fill.svg"
          alt="Likes"
          width="32"
          height="32"
          className="me-2"
        >
        </img>Likes
      </h1>
      <Posts posts={posts} userId={props.loginUserId} />
      <br />
      <br />
      {spinning &&
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      <div id="bottom">&nbsp;</div>
    </div>
  );
}
