import type ActiveEffect from "@client/documents/active-effect.mjs";
import type { ChangeEvent, JSX } from "react";

import { EffectChangesTable } from "@/components/blocks/EffectChangesTable";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { Input } from "@/components/ui/Input";
import { ProseMirrorField } from "@/components/ui/ProseMirrorField";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

interface EffectSheetAppProps {
  effect: ActiveEffect;
}

export function EffectSheetApp({ effect }: EffectSheetAppProps): JSX.Element {
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    void effect.update({ name: event.target.value });
  };

  return (
    <Sheet>
      <SheetHeader>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={1}>
            <GridCell solid pad={3}>
              <Stack gap={2}>
                <Text variant="label" color="primary">
                  {game.i18n.localize("ROBOTECH.Effect.Title")}
                </Text>
                <Input
                  value={effect.name}
                  onChange={handleNameChange}
                  size="large"
                  width="full"
                  aria-label={game.i18n.localize("ROBOTECH.Effect.Name")}
                  placeholder={game.i18n.localize("ROBOTECH.Effect.NamePlaceholder")}
                />
              </Stack>
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetHeader>

      <SheetBody>
        <GridSystem guideWidth={1}>
          <Grid columns={1} rows={2}>
            <GridCell solid pad={3}>
              <Stack gap={3}>
                <CardHeader>
                  <CardTitle>{game.i18n.localize("ROBOTECH.Tabs.Description")}</CardTitle>
                </CardHeader>
                <ProseMirrorField
                  name="description"
                  value={effect.description}
                  onChange={(value) => void effect.update({ description: value })}
                />
              </Stack>
            </GridCell>
            <GridCell solid pad={3}>
              <EffectChangesTable effect={effect} />
            </GridCell>
          </Grid>
        </GridSystem>
      </SheetBody>
    </Sheet>
  );
}
