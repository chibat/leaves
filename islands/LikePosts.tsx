import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import Posts from "~/components/Posts.tsx";
import { ResponsePost } from "~/common/types.ts";
import { PAGE_ROWS } from "~/common/constants.ts";
import { AppUser } from "~/server/db.ts";
import { trpc } from "~/client/trpc.ts";

export default function LikePosts(props: { loginUser?: AppUser }) {

  const posts = useSignal<Array<ResponsePost>>([]);
  const loading = useSignal<boolean>(false);
  const allLoaded = useSignal(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].intersectionRatio !== 0 && !allLoaded.value) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        loading.value = true;
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

  return (
    <div>
      <h1>Likes</h1>
      <Posts posts={posts} user={props.loginUser} />
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
