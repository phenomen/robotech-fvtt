import React, { useCallback } from "react";

import { Button } from "@/components/ui/Button";
import { Input, type InputSize, type InputWidth } from "@/components/ui/Input";
import { cn } from "@/utils";

export interface NumberInputProps {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null) => void;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  controls?: boolean;
  size?: InputSize;
  width?: InputWidth;
  "aria-label"?: string;
}

export const NumberInput = React.memo(function NumberInput({
  value,
  defaultValue,
  onValueChange,
  onChange,
  min,
  max,
  step,
  disabled,
  readOnly,
  placeholder,
  name,
  id,
  controls = false,
  size = "medium",
  width = "small",
  "aria-label": ariaLabel,
}: NumberInputProps): React.JSX.Element {
  const currentValue = value ?? defaultValue ?? null;

  const clampValue = useCallback(
    (val: number | null): number | null => {
      if (val === null || Number.isNaN(val)) return null;
      let clamped = val;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      return clamped;
    },
    [min, max],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        onValueChange?.(null);
        onChange?.(null);
        return;
      }
      const parsed = Number(raw);
      const clamped = clampValue(Number.isNaN(parsed) ? null : parsed);
      onValueChange?.(clamped);
      onChange?.(clamped);
    },
    [clampValue, onValueChange, onChange],
  );

  const handleDecrement = useCallback(() => {
    if (disabled || readOnly) return;
    const stepVal = step ?? 1;
    const base = currentValue ?? (min !== undefined ? min : 0);
    const next = clampValue(base - stepVal);
    onValueChange?.(next);
    onChange?.(next);
  }, [disabled, readOnly, step, currentValue, min, clampValue, onValueChange, onChange]);

  const handleIncrement = useCallback(() => {
    if (disabled || readOnly) return;
    const stepVal = step ?? 1;
    const base = currentValue ?? (min !== undefined ? min : 0);
    const next = clampValue(base + stepVal);
    onValueChange?.(next);
    onChange?.(next);
  }, [disabled, readOnly, step, currentValue, min, clampValue, onValueChange, onChange]);

  return (
    <div className={cn("inline-flex min-w-0 items-center gap-1", width === "full" && "w-full")}>
      {controls && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={disabled || readOnly}
          onClick={handleDecrement}
          title={game.i18n.localize("ROBOTECH.Buttons.Decrement")}
        >
          -
        </Button>
      )}
      <Input
        type="number"
        id={id}
        name={name}
        min={min}
        max={max}
        step={step}
        value={currentValue ?? ""}
        onChange={handleInputChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-label={ariaLabel}
        size={size}
        width={width}
      />
      {controls && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={disabled || readOnly}
          onClick={handleIncrement}
          title={game.i18n.localize("ROBOTECH.Buttons.Increment")}
        >
          +
        </Button>
      )}
    </div>
  );
});
