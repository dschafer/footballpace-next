import PaceTable from "./pace-table";
import PaceTablePlaceholder from "./pace-table-placeholder";
import { Suspense } from "react";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { shouldCachePaceData } from "@/lib/pace/data";
import { slicePaceTeams } from "@/lib/pace/pace-types";

type StandingsPaceTableProps = {
  rowCount?: number;
  league: string;
  year: number;
  targetFinish: number;
};

export default function StandingsPaceTable(props: StandingsPaceTableProps) {
  if (shouldCachePaceData(props.league, props.year, props.targetFinish)) {
    return <StandingsPaceTableContent {...props} />;
  }
  return (
    <Suspense
      fallback={
        <PaceTablePlaceholder
          rowCount={props.rowCount ?? 20}
          matchdayCount={20}
        />
      }
    >
      <StandingsPaceTableContent {...props} />
    </Suspense>
  );
}

async function StandingsPaceTableContent({
  rowCount,
  league,
  year,
  targetFinish,
}: StandingsPaceTableProps) {
  let paceTeams = await fetchPaceTeams(league, year, targetFinish);
  if (rowCount) {
    paceTeams = slicePaceTeams(paceTeams, rowCount, targetFinish);
  }
  return <PaceTable paceTeams={paceTeams} />;
}
