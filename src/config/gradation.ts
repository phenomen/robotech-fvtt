export const GRADATION_KEYS = ["worst", "bad", "neutral", "good", "best"] as const;
export type GradationKey = (typeof GRADATION_KEYS)[number];

export const GRADATION = {
  best: {
    color: "var(--rt-gradation-best)",
    textClass: "text-rt-gradation-best",
    dieClass: "rt-die-box--best",
    buttonClass:
      "bg-rt-gradation-best/30 text-rt-gradation-best! border-rt-gradation-best! focus:border-rt-gradation-best! hover:bg-rt-gradation-best/40 hover:text-rt-gradation-best! hover:border-rt-gradation-best!",
    buttonIdleClass:
      "bg-transparent text-rt-gradation-best! border-rt-gradation-best/50! hover:bg-rt-gradation-best/20 hover:text-rt-gradation-best! hover:border-rt-gradation-best! focus:border-rt-gradation-best! focus:outline-none!",
  },
  good: {
    color: "var(--rt-gradation-good)",
    textClass: "text-rt-gradation-good",
    dieClass: "rt-die-box--good",
    buttonClass:
      "bg-rt-gradation-good/30 text-rt-gradation-good! border-rt-gradation-good! focus:border-rt-gradation-good! hover:bg-rt-gradation-good/40 hover:text-rt-gradation-good! hover:border-rt-gradation-good!",
    buttonIdleClass:
      "bg-transparent text-rt-gradation-good! border-rt-gradation-good/50! hover:bg-rt-gradation-good/20 hover:text-rt-gradation-good! hover:border-rt-gradation-good! focus:border-rt-gradation-good! focus:outline-none!",
  },
  neutral: {
    color: "var(--rt-gradation-neutral)",
    textClass: "text-rt-gradation-neutral",
    dieClass: "rt-die-box--neutral",
    buttonClass:
      "bg-rt-gradation-neutral/30 text-rt-gradation-neutral! border-rt-gradation-neutral! focus:border-rt-gradation-neutral! hover:bg-rt-gradation-neutral/40 hover:text-rt-gradation-neutral! hover:border-rt-gradation-neutral!",
    buttonIdleClass:
      "bg-transparent text-rt-gradation-neutral! border-rt-gradation-neutral/50! hover:bg-rt-gradation-neutral/20 hover:text-rt-gradation-neutral! hover:border-rt-gradation-neutral! focus:border-rt-gradation-neutral! focus:outline-none!",
  },
  bad: {
    color: "var(--rt-gradation-bad)",
    textClass: "text-rt-gradation-bad",
    dieClass: "rt-die-box--bad",
    buttonClass:
      "bg-rt-gradation-bad/30 text-rt-gradation-bad! border-rt-gradation-bad! focus:border-rt-gradation-bad! hover:bg-rt-gradation-bad/40 hover:text-rt-gradation-bad! hover:border-rt-gradation-bad!",
    buttonIdleClass:
      "bg-transparent text-rt-gradation-bad! border-rt-gradation-bad/50! hover:bg-rt-gradation-bad/20 hover:text-rt-gradation-bad! hover:border-rt-gradation-bad! focus:border-rt-gradation-bad! focus:outline-none!",
  },
  worst: {
    color: "var(--rt-gradation-worst)",
    textClass: "text-rt-gradation-worst",
    dieClass: "rt-die-box--worst",
    buttonClass:
      "bg-rt-gradation-worst/30 text-rt-gradation-worst! border-rt-gradation-worst! focus:border-rt-gradation-worst! hover:bg-rt-gradation-worst/40 hover:text-rt-gradation-worst! hover:border-rt-gradation-worst!",
    buttonIdleClass:
      "bg-transparent text-rt-gradation-worst! border-rt-gradation-worst/50! hover:bg-rt-gradation-worst/20 hover:text-rt-gradation-worst! hover:border-rt-gradation-worst! focus:border-rt-gradation-worst! focus:outline-none!",
  },
} as const;

export const DIE_SUCCESS_GRADATION = {
  0: GRADATION.worst,
  1: GRADATION.neutral,
  2: GRADATION.best,
} as const;

export function dieSuccessGradation(
  successes: number,
): (typeof DIE_SUCCESS_GRADATION)[keyof typeof DIE_SUCCESS_GRADATION] {
  if (successes in DIE_SUCCESS_GRADATION) {
    return DIE_SUCCESS_GRADATION[successes as keyof typeof DIE_SUCCESS_GRADATION];
  }
  return GRADATION.worst;
}

export const GRADATION_LEVELS = [
  GRADATION.best,
  GRADATION.good,
  GRADATION.neutral,
  GRADATION.bad,
  GRADATION.worst,
] as const;
