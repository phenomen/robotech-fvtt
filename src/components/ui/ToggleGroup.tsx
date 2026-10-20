import { createContext, memo, useCallback, useContext, useMemo } from "react";
import type { JSX, ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";

interface ToggleGroupContextValue {
  value: string;
  onSelect: (itemValue: string) => void;
  disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

export const ToggleGroup = memo(
  ({ value, onValueChange, disabled = false, children }: ToggleGroupProps): JSX.Element => {
    const handleSelect = useCallback(
        (itemValue: string) => {
          onValueChange?.(itemValue);
        },
        [onValueChange]
      ),
      contextValue = useMemo(() => ({ disabled, onSelect: handleSelect, value }), [value, handleSelect, disabled]);

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <Stack direction="row" gap={1} align="center">
          {children}
        </Stack>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export const ToggleItem = memo(({ value: itemValue, disabled = false, children }: ToggleItemProps): JSX.Element => {
  const ctx = useContext(ToggleGroupContext),
    isSelected = ctx?.value === itemValue,
    isDisabled = (disabled || ctx?.disabled) ?? false,
    handleClick = useCallback(() => {
      ctx?.onSelect(itemValue);
    }, [ctx, itemValue]);

  return (
    <Button
      type="button"
      size="small"
      variant={isSelected ? "primary" : "secondary"}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
});
ToggleItem.displayName = "ToggleItem";
