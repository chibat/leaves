import { useEffect } from "preact/hooks";
import Posts from "~/components/Posts.tsx";

import { PAGE_ROWS } from "~/common/constants.ts";
import { useSignal } from "@preact/signals";
import { trpc } from "~/client/trpc.ts";
import { GetPostsOutput } from "~/server/trpc/procedures/getPosts.ts";

export default function AllPosts(props: { loginUserId?: number }) {

  const posts = useSignal<GetPostsOutput[]>([]);
  const requesting = useSignal<boolean>(false);
  const spinning = useSignal<boolean>(true);
  const allLoaded = useSignal(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (!requesting.value && entries[0].intersectionRatio !== 0 && !allLoaded.value) {
        const postId = posts.value.length === 0 ? null : posts.value[posts.value.length - 1].id;
        requesting.value = true;
        spinning.value = true;
        trpc.getPosts.query({ postId }).then(results => {
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
