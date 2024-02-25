import PaceSheet from "@/components/pace-sheet/pace-sheet";

export default function PaceSheetPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return <PaceSheet league={params.league} year={parseInt(params.year)} />;
}
