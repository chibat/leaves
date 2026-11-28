import { useEffect, useRef, useState } from "react";
import Posts from "~/components/Posts.tsx";
import { PAGE_ROWS } from "~/common/constants.ts";
import { api } from "~/client/api.ts";
import type { GetPostsOutput } from "~/common/types.ts";

export default function SearchedPosts(
  props: {
    searchWord: string;
    loginUserId?: number;
    initialPosts?: GetPostsOutput[];
  },
) {
  const [posts, setPosts] = useState<GetPostsOutput[]>(
    props.initialPosts ?? [],
  );
  const [spinning, setSpinning] = useState(props.initialPosts === undefined);
  const [notFound, setNotFound] = useState(
    props.initialPosts?.length === 0,
  );
  const postsRef = useRef(posts);
  const requesting = useRef(false);
  const allLoaded = useRef(
    props.initialPosts !== undefined && props.initialPosts.length < PAGE_ROWS,
  );

  useEffect(() => {
    const initialPosts = props.initialPosts ?? [];
    postsRef.current = initialPosts;
    setPosts(initialPosts);
    setSpinning(props.initialPosts === undefined);
    allLoaded.current = props.initialPosts !== undefined &&
      props.initialPosts.length < PAGE_ROWS;
    setNotFound(props.initialPosts?.length === 0);
    requesting.current = false;
  }, [props.initialPosts, props.searchWord]);

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
        const postId = lastPost?.id ?? null;
          const results = await api.getPosts({
          postId,
            searchWord: props.searchWord,
          });
          if (results.length > 0) {
            const nextPosts = postsRef.current.concat(results);
            postsRef.current = nextPosts;
            setPosts(nextPosts);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.current = true;
          }
          if (!postId && results.length === 0) {
            setNotFound(true);
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
  }, [props.searchWord]);

  return (
    <div>
      {notFound && <span>Not Found</span>}
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
