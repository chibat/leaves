import { Fragment, type ComponentChildren } from "preact";

export function Head({ children }: { children: ComponentChildren }) {
  return <Fragment>{children}</Fragment>;
}
