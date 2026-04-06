// Universal key for target finish selection used in URLs/params
// and a mapping to the numeric target finish used by pace logic.

export type TargetKey = "champion" | "ucl" | "safe";

export const TARGET_KEYS = ["champion", "ucl", "safe"] as const satisfies readonly TargetKey[];

export const targetKeyToFinish: Record<TargetKey, number> = {
  champion: 1,
  ucl: 4,
  safe: 17,
} as const;

export const targetKeyLabels: Record<TargetKey, string> = {
  champion: "Champion",
  ucl: "Champions League",
  safe: "Safe from Relegation",
} as const;

export function asTargetKey(v: string | null | undefined): TargetKey | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  return (TARGET_KEYS as readonly string[]).includes(s) ? (s as TargetKey) : undefined;
}

export function finishToTargetKey(finish: number): TargetKey {
  for (const key of TARGET_KEYS) {
    if (targetKeyToFinish[key] === finish) return key;
  }
  return "champion";
}

