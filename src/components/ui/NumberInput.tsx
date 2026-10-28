import { memo, useCallback, useRef } from "react";
import type { ChangeEvent, JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { InputSize, InputWidth } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

export interface NumberInputProps {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null) => void;
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
  title?: string;
  /** See `Input`'s `commit`. Use `change` when the value lives in React state rather than a document. */
  commit?: "blur" | "change";
}

/** A value this input committed that its `value` prop has not caught up with yet. */
interface PendingValue {
  from: number | null;
  to: number | null;
}

export const NumberInput = memo(
  ({
    value,
    defaultValue,
    onValueChange,
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
    title,
    commit,
  }: NumberInputProps): JSX.Element => {
    const currentValue = value ?? defaultValue ?? null,
      // Document updates land asynchronously. A typed value committed on blur (the blur a +/- click
      // causes) or a quick second click must step from what was committed, not the stale prop.
      pending = useRef<PendingValue | null>(null),
      commitValue = useCallback(
        (next: number | null, from: number | null) => {
          pending.current = { from, to: next };
          onValueChange?.(next);
        },
        [onValueChange]
      ),
      steppedBase = (): number => {
        const latest = pending.current,
          base = latest && latest.from === currentValue ? latest.to : currentValue;
        return base ?? min ?? 0;
      },
      clampValue = useCallback(
        (val: number | null): number | null => {
          if (val === null || Number.isNaN(val)) {
            return null;
          }
          let clamped = val;
          if (min !== undefined && clamped < min) {
            clamped = min;
          }
          if (max !== undefined && clamped > max) {
            clamped = max;
          }
          return clamped;
        },
        [min, max]
      ),
      handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
          const raw = e.target.value;
          if (raw === "") {
            commitValue(null, currentValue);
            return;
          }
          const parsed = Number(raw);
          commitValue(clampValue(Number.isNaN(parsed) ? null : parsed), currentValue);
        },
        [clampValue, commitValue, currentValue]
      ),
      stepBy = (direction: 1 | -1): void => {
        if (disabled || readOnly) {
          return;
        }
        commitValue(clampValue(steppedBase() + direction * (step ?? 1)), currentValue);
      };

    return (
      <div className={cn("inline-flex min-w-0 items-center gap-1", width === "full" && "w-full")}>
        {controls && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            disabled={disabled ?? readOnly}
            onClick={() => {
              stepBy(-1);
            }}
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
          title={title}
          commit={commit}
          size={size}
          width={width}
        />
        {controls && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            disabled={disabled ?? readOnly}
            onClick={() => {
              stepBy(1);
            }}
            title={game.i18n.localize("ROBOTECH.Buttons.Increment")}
          >
            +
          </Button>
        )}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";
