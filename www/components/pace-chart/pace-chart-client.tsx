"use client";

import { Box, Select, Skeleton } from "@mantine/core";
import { LineChart, type LineChartSeries } from "@mantine/charts";
import type { DateRow } from "./date-chart-data";
import { useIsClient } from "@/lib/use-is-client";
import { useState } from "react";

export type MatchdayRow = { matchday: number; [key: string]: number | string };

type AxisMode = "matchday" | "date";

export default function PaceChartClient({
  series,
  matchdayData,
  dateData,
  showAxisToggle = false,
  paceLabel,
}: {
  series: LineChartSeries[];
  matchdayData: MatchdayRow[];
  dateData: DateRow[];
  showAxisToggle?: boolean;
  paceLabel: string;
}) {
  const [axisMode, setAxisMode] = useState<AxisMode>("matchday");
  const isClient = useIsClient();

  const data = axisMode === "matchday" ? matchdayData : dateData;
  const dataKey = axisMode === "matchday" ? "matchday" : "date";
  const xAxisLabel = axisMode === "matchday" ? "Matchday" : "Date";

  if (!isClient) {
    return <Skeleton h={300} />;
  }

  return (
    <>
      {showAxisToggle && (
        <Box style={{ alignSelf: "flex-end", width: 160, marginBottom: 8 }}>
          <Select
            data={[
              { value: "matchday", label: "Matchday" },
              { value: "date", label: "Date" },
            ]}
            value={axisMode}
            onChange={(v) => setAxisMode((v as AxisMode) ?? "matchday")}
            aria-label="X-axis mode"
          />
        </Box>
      )}
      <LineChart
        h={300}
        data={data}
        series={series}
        dataKey={dataKey}
        curveType={axisMode === "date" ? "stepAfter" : "linear"}
        connectNulls={axisMode === "matchday"}
        withDots={axisMode === "matchday"}
        withLegend
        xAxisLabel={xAxisLabel}
        yAxisLabel={`vs. ${paceLabel} Pace`}
        tooltipAnimationDuration={200}
        referenceLines={[{ y: 0, label: `${paceLabel} Pace`, color: "red.3" }]}
      />
    </>
  );
}
