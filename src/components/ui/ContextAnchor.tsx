import { type JSX, type ReactNode } from "react";

interface ContextAnchorProps {
  name: string;
  children?: ReactNode;
}

export function ContextAnchor({ name, children }: ContextAnchorProps): JSX.Element {
  return <div className={name}>{children}</div>;
}
