import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import Posts from "~/components/Posts.tsx";
import { ResponsePost } from "~/common/types.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import { trpc } from "~/client/trpc.ts";

export default function LikePosts(props: { loginUserId?: number }) {

  const posts = useSignal<Array<ResponsePost>>([]);
  const spinning = useSignal<boolean>(true);
  const requesting = useSignal<boolean>(false);
  const allLoaded = useSignal(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (!requesting.value && entries[0].intersectionRatio !== 0 && !allLoaded.value) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        requesting.value = true;
        spinning.value = true;
        trpc.getLikedPosts.query({ postId }).then(results => {
          if (!results) {
            return;
          }
          if (results.length > 0) {
            posts.value = posts.value.concat(results);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.value = true;
          }
        }).finally(() => {
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
      <h1>
        <img
          src="/assets/img/heart-fill.svg"
          alt="Likes"
          width="32"
          height="32"
          class="me-2"
        >
        </img>Likes
      </h1>
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
