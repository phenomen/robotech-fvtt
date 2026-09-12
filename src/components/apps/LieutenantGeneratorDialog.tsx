import { useRef, useState } from "react";
import type { JSX } from "react";

import { ReactDialog } from "@/components/apps/ReactDialog";
import { DialogFooter } from "@/components/blocks/DialogFooter";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/Table";
import { Text } from "@/components/ui/Text";
import {
  LIEUTENANT_ELEMENT_OPTIONS,
  LIEUTENANT_FLAVOR_OPTIONS,
  LIEUTENANT_TYPE_OPTIONS,
  isChoiceValue,
  lieutenantHasFlavor,
} from "@/config";
import type { LieutenantElementValue, LieutenantFlavorValue, LieutenantTypeValue } from "@/config";
import type { ActorOf } from "@/models";
import type { AppOptions, CloseOptions } from "@/types/application";
import { createLieutenant, lieutenantNameOf, lieutenantSkillsOf } from "@/utils/createLieutenant";
import type { LieutenantSkillPreview } from "@/utils/createLieutenant";

interface LieutenantGeneratorContentProps {
  onClose: () => void;
  vessel?: ActorOf<"vessel">;
}

export function LieutenantGeneratorContent({ onClose, vessel }: LieutenantGeneratorContentProps): JSX.Element {
  const [type, setType] = useState<LieutenantTypeValue>("minor");
  const [element, setElement] = useState<LieutenantElementValue>("pilot");
  const [flavor, setFlavor] = useState<LieutenantFlavorValue>("supportive");
  const [veteran, setVeteran] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const showFlavor = lieutenantHasFlavor(element);
  const flavorValue = showFlavor ? flavor : undefined;
  const generatedName = lieutenantNameOf({ element, flavor: flavorValue, type, veteran });

  const handleCreate = async (): Promise<void> => {
    if (creating) {
      return;
    }
    setCreating(true);
    const typed = (nameRef.current?.value ?? name).trim();
    const actor = await createLieutenant({
      element,
      flavor: flavorValue,
      name: typed === "" ? generatedName : typed,
      openSheet: !vessel,
      type,
      vessel,
      veteran,
    });
    if (actor) {
      onClose();
      return;
    }
    setCreating(false);
  };

  return (
    <Stack pad={4} gap={3} direction="column">
      <Stack direction="row" gap={3}>
        <Field orientation="vertical" label={game.i18n.localize("ROBOTECH.Lieutenant.Type")}>
          <Select
            width="full"
            value={type}
            onChange={(event) => {
              const next = event.target.value;
              if (isChoiceValue(LIEUTENANT_TYPE_OPTIONS, next)) {
                setType(next);
              }
            }}
          >
            {LIEUTENANT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {game.i18n.localize(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>

        <Field orientation="vertical" label={game.i18n.localize("ROBOTECH.Lieutenant.Element")}>
          <Select
            width="full"
            value={element}
            onChange={(event) => {
              const next = event.target.value;
              if (isChoiceValue(LIEUTENANT_ELEMENT_OPTIONS, next)) {
                setElement(next);
              }
            }}
          >
            {LIEUTENANT_ELEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {game.i18n.localize(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>

        {showFlavor && (
          <Field orientation="vertical" label={game.i18n.localize("ROBOTECH.Lieutenant.Flavor")}>
            <Select
              width="full"
              value={flavor}
              onChange={(event) => {
                const next = event.target.value;
                if (isChoiceValue(LIEUTENANT_FLAVOR_OPTIONS, next)) {
                  setFlavor(next);
                }
              }}
            >
              {LIEUTENANT_FLAVOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {game.i18n.localize(option.labelKey)}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field orientation="vertical" label={game.i18n.localize("ROBOTECH.Lieutenant.Veteran")}>
          <Checkbox checked={veteran} onCheckedChange={setVeteran} size="large" />
        </Field>
      </Stack>

      <Field label={game.i18n.localize("ROBOTECH.Sheet.Name")}>
        <Input
          ref={nameRef}
          width="full"
          value={name}
          placeholder={generatedName}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </Field>

      <SkillPreview type={type} element={element} />

      <DialogFooter
        confirmKey="ROBOTECH.Lieutenant.Create"
        confirmDisabled={creating}
        onCancel={onClose}
        onConfirm={() => {
          void handleCreate();
        }}
      />
    </Stack>
  );
}

function SkillPreview({ element, type }: { element: LieutenantElementValue; type: LieutenantTypeValue }): JSX.Element {
  const skills = lieutenantSkillsOf(type, element);
  return (
    <Table fixed>
      <TableHeader>
        <TableRow>
          {skills.map((skill) => (
            <SkillCell key={skill.name} skill={skill} kind="name" />
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          {skills.map((skill) => (
            <SkillCell key={skill.name} skill={skill} kind="value" />
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}

function SkillCell({ kind, skill }: { kind: "name" | "value"; skill: LieutenantSkillPreview }): JSX.Element {
  return (
    <TableCell width="grow" align="center">
      <Text
        variant={kind === "name" ? "label" : "mono"}
        color={kind === "name" ? "muted" : "foreground"}
        align="center"
      >
        {kind === "name" ? skill.name : skill.value}
      </Text>
    </TableCell>
  );
}

export class LieutenantGeneratorApp extends ReactDialog {
  constructor(
    private readonly vessel: ActorOf<"vessel"> | undefined,
    options: AppOptions = {}
  ) {
    super(options);
  }

  static override DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["robotech", "dialog", "lieutenant-generator"],
    id: "robotech-lieutenant-generator",
    position: { height: "auto", width: 450 },
    window: {
      ...super.DEFAULT_OPTIONS.window,
      resizable: false,
      title: "ROBOTECH.Lieutenant.Title",
    },
  };

  protected override renderContent(): JSX.Element {
    return <LieutenantGeneratorContent vessel={this.vessel} onClose={() => void this.close()} />;
  }

  override _onClose(options: CloseOptions): void {
    if (currentApp === this) {
      currentApp = null;
    }
    super._onClose(options);
  }
}

let currentApp: LieutenantGeneratorApp | null = null;

export function openLieutenantGenerator(vessel?: ActorOf<"vessel">): void {
  void (async () => {
    if (currentApp) {
      await currentApp.close();
    }
    currentApp = new LieutenantGeneratorApp(vessel);
    void currentApp.render(true);
  })();
}
