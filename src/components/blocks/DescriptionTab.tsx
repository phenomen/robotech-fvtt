import type { JSX } from "react";

import { CardHeader, CardTitle } from "@/components/ui/Card";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import type { ProseMirrorFieldProps } from "@/components/ui/ProseMirrorField";
import { Stack } from "@/components/ui/Stack";

interface DescriptionTabProps {
  title?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: ProseMirrorFieldProps["minHeight"];
}

export function DescriptionTab({ title, name, value, onChange, minHeight }: DescriptionTabProps): JSX.Element {
  return (
    <Stack gap={3}>
      <CardHeader>
        <CardTitle>{title ?? game.i18n.localize("ROBOTECH.Tabs.Description")}</CardTitle>
      </CardHeader>
      <ProseMirrorField
        name={name}
        value={value}
        onChange={(next) => {
          onChange(next);
        }}
        minHeight={minHeight}
      />
    </Stack>
  );
}
