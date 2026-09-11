import type { JSX } from "react";

import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";

interface DialogFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmKey?: string;
  confirmDisabled?: boolean;
}

export function DialogFooter({
  onCancel,
  onConfirm,
  confirmKey = "ROBOTECH.Buttons.Save",
  confirmDisabled = false,
}: DialogFooterProps): JSX.Element {
  return (
    <Stack direction="row" gap={2} justify="end" shrink>
      <Button size="medium" variant="outline" onClick={onCancel}>
        {game.i18n.localize("ROBOTECH.Buttons.Cancel")}
      </Button>
      <Button size="medium" variant="primary" disabled={confirmDisabled} onClick={onConfirm}>
        {game.i18n.localize(confirmKey)}
      </Button>
    </Stack>
  );
}
