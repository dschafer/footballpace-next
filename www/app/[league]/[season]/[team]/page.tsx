import FixturesTable from "@/components/fixtures-table";

export default function Team({
  params,
}: {
  params: {
    league: string;
    season: string;
    team: string;
  };
}) {
  return (
    <FixturesTable
      league={params.league}
      season={parseInt(params.season)}
      team={params.team}
    />
  );
}
