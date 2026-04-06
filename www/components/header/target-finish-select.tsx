"use client";

import {
  TARGET_KEYS,
  type TargetKey,
  finishToTargetKey,
  targetKeyLabels,
} from "@/lib/pace/target-key";
import { useCallback, useState } from "react";
import { Select } from "@mantine/core";

export default function TargetFinishSelect({
  initialValue,
}: {
  initialValue: number;
}) {
  const [value, setValue] = useState<TargetKey>(() => {
    try {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("target");
      if (t && (TARGET_KEYS as readonly string[]).includes(t)) {
        return t as TargetKey;
      }
    } catch {}
    return finishToTargetKey(initialValue);
  });

  const onChange = useCallback((val: string | null) => {
    if (!val) return;
    const key = val as TargetKey;
    setValue(key);
    const url = new URL(window.location.href);
    if (key === "champion") {
      url.searchParams.delete("target");
    } else {
      url.searchParams.set("target", key);
    }
    window.location.assign(url.toString());
  }, []);

  return (
    <Select
      size="xs"
      value={value}
      onChange={onChange}
      data={TARGET_KEYS.map((k) => ({ value: k, label: targetKeyLabels[k] }))}
      allowDeselect={false}
      label="Pace Target: "
      styles={{
        root: {
          display: "flex",
          alignItems: "center",
          gap: "var(--mantine-spacing-md)",
        },
        input: { flexShrink: 0, fontSize: "var(--mantine-font-size-md)" },
        label: {
          marginBottom: 0,
          flexShrink: 0,
          fontWeight: 700,
          fontSize: "var(--mantine-font-size-md)",
        },
      }}
    />
  );
}

