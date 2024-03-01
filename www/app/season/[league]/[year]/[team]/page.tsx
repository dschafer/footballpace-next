import FixturesTable from "@/components/fixtures-table/fixtures-table";

export default function SeasonPage({
  params,
}: {
  params: {
    league: string;
    year: string;
    team: string;
  };
}) {
  return (
    <FixturesTable
      league={params.league}
      year={parseInt(params.year)}
      team={params.team}
    />
  );
}