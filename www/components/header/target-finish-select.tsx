"use client";

import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyLabels,
} from "@/lib/pace/target-key";
import { Select } from "@mantine/core";
import { useCallback } from "react";
import { useTargetKey } from "@/context/target-context";

export default function TargetFinishSelect() {
  const value = useTargetKey();

  const onChange = useCallback((val: string | null) => {
    if (!val) return;
    const key = val as TargetKey;
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
