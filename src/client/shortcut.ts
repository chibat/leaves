import { bind, unbind } from "mousetrap";

export function shortcut(
  navigate: (path: string) => void,
  profilePath?: string,
): () => void {
  bind("/", () => {
    navigate("/search");
  });
  bind("n", () => {
    navigate("/posts/new");
  });
  bind("?", () => {
    navigate("/shortcuts");
  });
  bind(".", () => {
    window.scroll({ top: 0, behavior: "smooth" });
  });
  bind("g a", () => {
    navigate("/about");
  });
  bind("g h", () => {
    navigate("/");
  });
  bind("g n", () => {
    navigate("/notification");
  });
  bind("g l", () => {
    navigate("/likes");
  });
  bind("g f", () => {
    navigate("/following");
  });
  if (profilePath) bind("g p", () => navigate(profilePath));
  return () => {
    for (
      const key of [
        "/",
        "n",
        "?",
        ".",
        "g a",
        "g h",
        "g n",
        "g l",
        "g f",
        "g p",
      ]
    ) {
      unbind(key);
    }
  };
}
