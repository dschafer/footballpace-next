import { Box, ScrollArea } from "@mantine/core";
import type { ReactNode } from "react";

export default function TodaysMatchesStrip({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <ScrollArea offsetScrollbars scrollbarSize={6} type="auto">
      <Box
        style={{
          display: "grid",
          gap: "var(--mantine-spacing-xs)",
          gridAutoColumns: "clamp(19rem, calc(50% - 0.25rem), 26rem)",
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(2, auto)",
          paddingBottom: "var(--mantine-spacing-xs)",
        }}
      >
        {children}
      </Box>
    </ScrollArea>
  );
}
