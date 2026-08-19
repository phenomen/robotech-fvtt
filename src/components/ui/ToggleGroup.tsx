import React, { createContext, useCallback, useContext, useMemo } from "react";

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
  children: React.ReactNode;
}

export const ToggleGroup = React.memo(function ToggleGroup({
  value,
  onValueChange,
  disabled = false,
  children,
}: ToggleGroupProps): React.JSX.Element {
  const handleSelect = useCallback(
    (itemValue: string) => {
      onValueChange?.(itemValue);
    },
    [onValueChange],
  );

  const contextValue = useMemo(() => ({ value, onSelect: handleSelect, disabled }), [value, handleSelect, disabled]);

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <Stack direction="row" gap={1} align="center">
        {children}
      </Stack>
    </ToggleGroupContext.Provider>
  );
});

export interface ToggleItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ToggleItem = React.memo(function ToggleItem({
  value: itemValue,
  disabled = false,
  children,
}: ToggleItemProps): React.JSX.Element {
  const ctx = useContext(ToggleGroupContext);
  const isSelected = ctx?.value === itemValue;
  const isDisabled = disabled || ctx?.disabled || false;

  const handleClick = useCallback(() => {
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
