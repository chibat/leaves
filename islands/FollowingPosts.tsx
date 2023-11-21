import { useEffect } from "preact/hooks";
import { ResponsePost } from "~/common/types.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import Posts from "~/components/Posts.tsx";
import { useSignal } from "@preact/signals";
import { trpc } from "~/client/trpc.ts";

export default function FollowingPosts(props: { loginUserId?: number }) {

  const posts = useSignal<Array<ResponsePost>>([]);
  const allLoaded = useSignal(false);
  const requesting = useSignal<boolean>(false);
  const spinning = useSignal<boolean>(true);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (!allLoaded.value && !requesting.value && entries[0].intersectionRatio !== 0) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        requesting.value = true;
        spinning.value = true;
        trpc.getPosts.query({ postId, following: true }).then(results => {
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
        io.unobserve(bottom)
      }
    };
  }, []);

  return (
    <div>
      <h1>Following</h1>
      <Posts posts={posts} userId={props.loginUserId} />
      <br />
      <br />
      {spinning.value &&
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
