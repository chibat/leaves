import { useEffect } from "preact/hooks";
import Posts from "~/components/Posts.tsx";
import { ResponsePost } from "~/lib/types.ts";
import { PAGE_ROWS } from "~/lib/constants.ts";
import { request } from "~/lib/request.ts";
import { RequestType, ResponseType } from "~/routes/api/get_liked_posts.ts";
import { useSignal } from "@preact/signals";
import { AppUser } from "~/lib/db.ts";

export default function LikePosts(props: { loginUser?: AppUser }) {

  const posts = useSignal<Array<ResponsePost>>([]);
  const loading = useSignal<boolean>(false);
  const allLoaded = useSignal(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].intersectionRatio !== 0 && !allLoaded.value) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        loading.value = true;
        request<RequestType, ResponseType>("get_liked_posts", { postId, }).then(results => {
          if (results.length > 0) {
            posts.value = posts.value.concat(results);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.value = true;
          }
        });
        loading.value = false;
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
      <div id="bottom"></div>
    </div>
  );
}
