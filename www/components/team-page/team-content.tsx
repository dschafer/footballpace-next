import { slicePaceTeams, slicePaceTeamsStart } from "@/lib/pace/pace-types";

import LinkableHeader from "@/components/header/linkable-header";
import OpponentsTable from "@/components/opponents/opponents-table";
import PaceChart from "@/components/pace-chart/pace-chart";
import PaceTable from "@/components/pace-table/pace-table";
import ResultsTable from "@/components/results-table/results-table";
import { Suspense } from "react";
import TeamContentPlaceholder from "@/components/team-page/team-content-placeholder";
import TeamFixtures from "@/components/team-fixtures/team-fixtures";
import { Text } from "@mantine/core";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";
import { shouldCachePaceData } from "@/lib/pace/data";

type TeamContentProps = {
  league: string;
  seasonYear: number;
  team: string;
  targetFinish: number;
};

export default function TeamContent(props: TeamContentProps) {
  if (
    shouldCachePaceData(props.league, props.seasonYear, props.targetFinish)
  ) {
    return <TeamContentData {...props} />;
  }
  return (
    <Suspense fallback={<TeamContentPlaceholder />}>
      <TeamContentData {...props} />
    </Suspense>
  );
}

async function TeamContentData({
  league,
  seasonYear,
  team,
  targetFinish,
}: TeamContentProps) {
  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(league, seasonYear, targetFinish),
    fetchTeamColorMap(),
  ]);
  const paceTeam = paceTeams.find((pt) => pt.team == team);

  if (!paceTeam) {
    return <Text c="dimmed">No matches found for this team yet.</Text>;
  }

  const previewMatches = Array.from(paceTeam.paceMatches).reverse().slice(0, 3);

  return (
    <>
      <LinkableHeader order={3} title="Recent Matches" />
      <ResultsTable
        paceMatches={previewMatches}
        league={league}
        team={team}
      />
      <LinkableHeader order={3} title="Table" />
      <PaceTable
        paceTeams={slicePaceTeams(paceTeams, 5, targetFinish)}
        startPlace={slicePaceTeamsStart(paceTeams, 5, targetFinish)}
      />
      <LinkableHeader order={3} title="Pace Chart" />
      <PaceChart
        paceTeams={[paceTeam]}
        teamColorMap={teamColorMap}
        targetFinish={targetFinish}
      />
      <OpponentsTable
        league={league}
        year={seasonYear}
        paceTeam={paceTeam}
        targetFinish={targetFinish}
      />
      <LinkableHeader order={3} title="Full Results" />
      <ResultsTable
        paceMatches={paceTeam.paceMatches}
        league={league}
        team={team}
      />
      <TeamFixtures
        league={league}
        year={seasonYear}
        team={team}
        targetFinish={targetFinish}
      />
    </>
  );
}
