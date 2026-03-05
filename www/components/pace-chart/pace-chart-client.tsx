"use client";

import { Box, Select } from "@mantine/core";
import { LineChart, type LineChartSeries } from "@mantine/charts";
import { useState } from "react";

export type MatchdayRow = { matchday: number; [key: string]: number | string };
export type DateRow = { date: string; [key: string]: number | string | null };

type AxisMode = "matchday" | "date";

export default function PaceChartClient({
  series,
  matchdayData,
  dateData,
  showAxisToggle = false,
}: {
  series: LineChartSeries[];
  matchdayData: MatchdayRow[];
  dateData: DateRow[];
  showAxisToggle?: boolean;
}) {
  const [axisMode, setAxisMode] = useState<AxisMode>("matchday");

  const data = axisMode === "matchday" ? matchdayData : dateData;
  const dataKey = axisMode === "matchday" ? "matchday" : "date";
  const xAxisLabel = axisMode === "matchday" ? "Matchday" : "Date";

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
        curveType="linear"
        connectNulls
        withLegend
        xAxisLabel={xAxisLabel}
        yAxisLabel="vs. Championship Pace"
        tooltipAnimationDuration={200}
        referenceLines={[{ y: 0, label: "Championship Pace", color: "red.3" }]}
      />
    </>
  );
}
