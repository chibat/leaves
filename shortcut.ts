import { trpc } from "~/trpc/client.ts";
import Mousetrap from "mousetrap";

export function shortcut() {
  Mousetrap.bind("/", () => {
    location.href = "/search";
  });
  Mousetrap.bind("n", () => {
    location.href = "/posts/new";
  });
  Mousetrap.bind("?", () => {
    location.href = "/help";
  });
  Mousetrap.bind(".", () => {
    window.scroll({ top: 0, behavior: "smooth" });
  });
  Mousetrap.bind("g a", () => {
    location.href = "/about";
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
