import type { JSX } from "react";

import { Grid, GridCell, GridSystem } from "@/components/ui/Grid";
import { SheetBody } from "@/components/ui/Sheet";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";

export function RedactedBody(): JSX.Element {
  return (
    <SheetBody>
      <GridSystem guideWidth={1}>
        <Grid columns={1} rows={1}>
          <GridCell solid pad={6}>
            <Stack align="center" justify="center" pad={6}>
              <Text variant="title" size="large" color="danger" align="center">
                {game.i18n.localize("ROBOTECH.Sheet.Redacted")}
              </Text>
            </Stack>
          </GridCell>
        </Grid>
      </GridSystem>
    </SheetBody>
  );
}
