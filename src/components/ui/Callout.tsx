import type { JSX, ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";

export type CalloutTone = "default" | "info" | "danger";

export interface CalloutProps {
  children: ReactNode;
  icon?: string;
  tone?: CalloutTone;
  onClick?: () => void;
  title?: string;
}

const FRAME_CLASS: Record<CalloutTone, string> = {
  danger: "bg-rt-danger/10 border-rt-danger",
  default: "",
  info: "bg-rt-primary/10 border-rt-primary",
};

export function Callout({ children, icon, tone = "default", onClick, title }: CalloutProps): JSX.Element {
  const frameClass = cn(
    "flex h-full w-full items-center justify-center border border-dashed",
    onClick && "cursor-pointer bg-transparent p-0",
    FRAME_CLASS[tone]
  );
  const inner = (
    <Stack direction="row" gap={2} align="center" justify="center" pad={2}>
      {icon ? <Icon name={icon} tone={tone === "danger" ? "danger" : "primary"} /> : null}
      <Text variant="mono" color={tone === "danger" ? "danger" : "muted"} align="center">
        {children}
      </Text>
    </Stack>
  );

  if (onClick) {
    return (
      <button type="button" className={frameClass} data-slot="callout" onClick={onClick} title={title}>
        {inner}
      </button>
    );
  }

  return (
    <div className={frameClass} data-slot="callout" title={title}>
      {inner}
    </div>
  );
}
