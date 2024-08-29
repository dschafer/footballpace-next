import PaceTable from "@/components/pace-table/pace-table";

export default function TablePage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return <PaceTable league={params.league} year={parseInt(params.year)} />;
}
