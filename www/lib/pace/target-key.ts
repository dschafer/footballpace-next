// Universal key for target finish selection used in URLs/params
// and a mapping to the numeric target finish used by pace logic.

export type TargetKey = "champion" | "ucl" | "safe";

export const TARGET_KEYS = [
  "champion",
  "ucl",
  "safe",
] as const satisfies readonly TargetKey[];

import leagues from "@/lib/const/leagues";

export function targetKeyToFinish(league: string): Record<TargetKey, number> {
  const safety = leagues.get(league)?.relegationSafetyPosition ?? 17;
  return {
    champion: 1,
    ucl: 4,
    safe: safety,
  } as const;
}

export const targetKeyLabels: Record<TargetKey, string> = {
  champion: "Champion",
  ucl: "Champions League",
  safe: "Safe from Relegation",
} as const;

export function asTargetKey(
  v: string | null | undefined,
): TargetKey | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  return (TARGET_KEYS as readonly string[]).includes(s)
    ? (s as TargetKey)
    : undefined;
}

export function finishToTargetKey(finish: number): TargetKey {
  if (finish === 1) return "champion";
  if (finish === 4) return "ucl";
  if (finish === 15 || finish === 17) return "safe";
  return "champion";
}
