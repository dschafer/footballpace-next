import LinkableHeader from "@/components/header/linkable-header";
import PaceChartPlaceholder from "@/components/pace-chart/pace-chart-placeholder";
import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";
import ResultsTablePlaceholder from "@/components/results-table/results-table-placeholder";
import TeamFixturesPlaceholder from "@/components/team-fixtures/team-fixtures-placeholder";

export default function TeamContentPlaceholder() {
  return (
    <>
      <LinkableHeader order={3} title="Recent Matches" />
      <ResultsTablePlaceholder rowCount={3} />
      <LinkableHeader order={3} title="Table" />
      <PaceTablePlaceholder rowCount={5} matchdayCount={38} />
      <LinkableHeader order={3} title="Pace Chart" />
      <PaceChartPlaceholder />
      <LinkableHeader order={3} title="Full Results" />
      <ResultsTablePlaceholder rowCount={19} />
      <TeamFixturesPlaceholder matchCount={19} />
    </>
  );
}
