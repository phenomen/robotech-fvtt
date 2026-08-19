import React from "react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Stack } from "@/components/ui/Stack";

interface TrackerHexProps {
  color: string;
  isFilled: boolean;
  label: string;
  onClick: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
  title: string;
}

export const TrackerHex = React.memo(function TrackerHex({
  color,
  isFilled,
  label,
  onClick,
  onContextMenu,
  title,
}: TrackerHexProps): React.JSX.Element {
  const fill = isFilled ? `color-mix(in srgb, ${color} 50%, transparent)` : "var(--rt-input)";

  return (
    <Button type="button" variant="ghost" size="tracker" onClick={onClick} onContextMenu={onContextMenu} title={title}>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <polygon
          points="25,5 75,5 98,50 75,95 25,95 2,50"
          stroke={color}
          strokeWidth="5"
          strokeLinejoin="round"
          fill={fill}
        />
        {label && (
          <text
            x="50"
            y="54"
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize="44"
            fontWeight="600"
            className="font-rt-mono pointer-events-none select-none"
          >
            {label}
          </text>
        )}
      </svg>
    </Button>
  );
});

export interface HexInputProps {
  color: string;
  label: string;
  icon?: string;
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
}

export const HexInput = React.memo(function HexInput({
  color,
  label,
  icon,
  value,
  onValueChange,
  min = 1,
}: HexInputProps): React.JSX.Element {
  return (
    <Stack direction="row" gap={2} align="center">
      <Label icon={icon} iconTone="danger">
        {label}
      </Label>
      <TrackerHex
        color={color}
        isFilled={false}
        label={String(value)}
        onClick={() => onValueChange(value + 1)}
        onContextMenu={(e) => {
          e.preventDefault();
          onValueChange(Math.max(min, value - 1));
        }}
        title={label}
      />
    </Stack>
  );
});
