import type Actor from "@client/documents/actor.mjs";
import { type JSX } from "react";

import { ItemList } from "@/components/blocks/ItemList";

interface EquipmentSuitesBlockProps {
  actor: Actor;
}

export function EquipmentSuitesBlock({ actor }: EquipmentSuitesBlockProps): JSX.Element {
  return (
    <ItemList actor={actor} itemType="equipment_suite" title={game.i18n.localize("ROBOTECH.Item.EquipmentSuitePl")} />
  );
}
