import { type JSX, type ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";

export type CalloutTone = "default" | "info" | "danger";

export interface CalloutProps {
  children: ReactNode;
  icon?: string;
  tone?: CalloutTone;
}

const FRAME_CLASS: Record<CalloutTone, string> = {
  default: "",
  info: "bg-rt-primary/10 border-rt-primary",
  danger: "bg-rt-danger/10 border-rt-danger",
};

export function Callout({ children, icon, tone = "default" }: CalloutProps): JSX.Element {
  return (
    <div
      className={cn("flex h-full w-full items-center justify-center border border-dashed", FRAME_CLASS[tone])}
      data-slot="callout"
    >
      <Stack direction="row" gap={2} align="center" justify="center" pad={2}>
        {icon ? <Icon name={icon} tone={tone === "danger" ? "danger" : "primary"} /> : null}
        <Text variant="button" color={tone === "danger" ? "danger" : "muted"} align="center">
          {children}
        </Text>
      </Stack>
    </div>
  );
}
