import { useEffect, useState } from "preact/hooks";
import { request } from "~/lib/request.ts";
import { ResponsePost } from "~/lib/types.ts";
import { PAGE_ROWS } from "~/lib/constants.ts";
import { RequestType, ResponseType } from "~/routes/api/get_posts.ts";
import Posts from "~/components/Posts.tsx";
import { useSignal } from "@preact/signals";

export default function FollowingPosts() {
  console.debug("start ");

  const posts = useSignal<Array<ResponsePost>>([]);
  const allLoaded = useSignal(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].intersectionRatio !== 0 && !allLoaded.value) {
        const postId = posts.value.length === 0 ? undefined : posts.value[posts.value.length - 1].id;
        setLoading(true);
        request<RequestType, ResponseType>("get_posts", { postId, direction: "next", followig: true }).then(results => {
          if (results.length > 0) {
            posts.value = posts.value.concat(results);
          }
          if (results.length < PAGE_ROWS) {
            allLoaded.value = true;
          }
        });
        setLoading(false);
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
      <Posts posts={posts} />
      <br />
      <br />
      {loading &&
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
