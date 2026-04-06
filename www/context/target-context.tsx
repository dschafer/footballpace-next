"use client";

import { createContext, useContext } from "react";
import type { TargetKey } from "@/lib/pace/target-key";

type TargetContextValue = {
  targetKey: TargetKey;
};

const defaultValue: TargetContextValue = {
  targetKey: "champion",
};

const TargetContext = createContext<TargetContextValue>(defaultValue);

export function TargetProvider({
  targetKey,
  children,
}: {
  targetKey: TargetKey;
  children: React.ReactNode;
}) {
  return (
    <TargetContext.Provider value={{ targetKey }}>
      {children}
    </TargetContext.Provider>
  );
}

export function useTargetKey() {
  return useContext(TargetContext).targetKey;
}
