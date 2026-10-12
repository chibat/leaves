import { trpc } from "./trpc.ts";
import Mousetrap from "mousetrap";
import { navigate } from "astro:transitions/client";

export function shortcut() {
  Mousetrap.bind("/", () => {
    void navigate("/search");
  });
  Mousetrap.bind("n", () => {
    void navigate("/posts/new");
  });
  Mousetrap.bind("?", () => {
    void navigate("/shortcuts");
  });
  Mousetrap.bind(".", () => {
    window.scroll({ top: 0, behavior: "smooth" });
  });
  Mousetrap.bind("g a", () => {
    void navigate("/about");
  });
  Mousetrap.bind("g h", () => {
    void navigate("/");
  });
  Mousetrap.bind("g n", () => {
    void navigate("/notification");
  });
  Mousetrap.bind("g l", () => {
    void navigate("/likes");
  });
  Mousetrap.bind("g f", () => {
    void navigate("/following");
  });
  Mousetrap.bind("g p", () => {
    trpc.getSession.query().then((session) => {
      if (session?.user.id) {
        void navigate(`/users/${session.user.account ?? session.user.id}`);
      }
    });
  });
}
