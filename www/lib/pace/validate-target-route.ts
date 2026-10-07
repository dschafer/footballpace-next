import { TARGET_KEYS, type TargetKey } from "@/lib/pace/target-key";
import { notFound } from "next/navigation";

export function validateTargetRoute(target: string): TargetKey {
  const targetKey = TARGET_KEYS.find((key) => key === target);
  if (targetKey === undefined) {
    notFound();
  }
  return targetKey;
}
