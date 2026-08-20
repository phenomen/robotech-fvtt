import type { RollModifierValue } from "@/config/choices";

export interface RollOptions {
  diceCount: number;
  modifier: RollModifierValue;
}

export interface Ad6DieResult {
  die: number;
  successes: number;
}

export interface Ad6RollResult {
  roll: foundry.dice.Roll;
  successes: number;
  dice: Ad6DieResult[];
}

export function calcDieSuccess(die: number, modifier: RollModifierValue): number {
  if (modifier === "disadvantage") {
    return die === 6 ? 1 : 0;
  }
  if (modifier === "hindrance") {
    return die === 6 ? 2 : 0;
  }
  if (modifier === "nominal") {
    if (die === 6) return 2;
    if (die === 5) return 1;
    return 0;
  }
  if (modifier === "edge") {
    if (die === 6) return 2;
    if (die >= 4) return 1;
    return 0;
  }
  if (modifier === "advantage") {
    if (die >= 5) return 2;
    if (die === 4) return 1;
    return 0;
  }
  return 0;
}

export async function evaluateAd6Roll(options: RollOptions): Promise<Ad6RollResult> {
  const count = Math.max(1, options.diceCount);
  const roll = await new foundry.dice.Roll(`${count}d6`).evaluate();
  const faces: number[] = roll.dice[0]?.results.map((result) => result.result) ?? [];

  let successes = 0;
  const dice = faces.map((die) => {
    const dieSuccesses = calcDieSuccess(die, options.modifier);
    successes += dieSuccesses;
    return { die, successes: dieSuccesses };
  });

  return { roll, successes, dice };
}
