import { trpc } from "./trpc.ts";
import { bind } from "mousetrap";
import { navigate } from "astro:transitions/client";

export function shortcut() {
  bind("/", () => {
    void navigate("/search");
  });
  bind("n", () => {
    void navigate("/posts/new");
  });
  bind("?", () => {
    void navigate("/shortcuts");
  });
  bind(".", () => {
    window.scroll({ top: 0, behavior: "smooth" });
  });
  bind("g a", () => {
    void navigate("/about");
  });
  bind("g h", () => {
    void navigate("/");
  });
  bind("g n", () => {
    void navigate("/notification");
  });
  bind("g l", () => {
    void navigate("/likes");
  });
  bind("g f", () => {
    void navigate("/following");
  });
  bind("g p", () => {
    trpc.getSession.query().then((session) => {
      if (session?.user.id) {
        void navigate(`/users/${session.user.account ?? session.user.id}`);
      }
    });
  });
}
