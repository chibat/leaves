import { trpc } from "~/trpc/client.ts";
import Mousetrap from "mousetrap";

export function shortcut() {
  Mousetrap.bind("/", () => {
    location.href = "/search";
  });
  Mousetrap.bind("n", () => {
    location.href = "/posts/new";
  });
  Mousetrap.bind(".", () => {
    window.scroll({ top: 0, behavior: "smooth" });
  });
  Mousetrap.bind("g h", () => {
    location.href = "/";
  });
  Mousetrap.bind("g n", () => {
    location.href = "/notification";
  });
  Mousetrap.bind("g l", () => {
    location.href = "/likes";
  });
  Mousetrap.bind("g f", () => {
    location.href = "/following";
  });
  Mousetrap.bind("g p", () => {
    trpc.getSession.query().then((session) => {
      if (session?.user.id) {
        console.log(session);
        location.href = `/users/${session.user.id}`;
      }
    });
  });
}

export function registerJumpElements(elements: HTMLCollectionOf<Element>) {
  const KEYCODE_J = "j";
  const KEYCODE_K = "k";

  let currentIndex = -1;

  const scollElement = (event: KeyboardEvent) => {
    if (event.key == ".") {
      currentIndex = -1;
    }
    if (event.key != KEYCODE_J && event.key != KEYCODE_K) {
      return;
    }
    // 次の位置を計算
    let nextIndex = currentIndex + ((event.key == KEYCODE_J) ? 1 : -1);

    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= elements.length) {
      nextIndex = elements.length - 1;
    }

    // 要素が表示されるようにスクロール
    elements[nextIndex].scrollIntoView();
    currentIndex = nextIndex;
  };

  if (document.addEventListener) {
    document.addEventListener(
      "keydown",
      scollElement,
      false,
    );
  }
}
