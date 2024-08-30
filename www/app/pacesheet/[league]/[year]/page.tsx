import PaceSheet from "@/components/pace-sheet/pace-sheet";
import PaceSheetPreamble from "@/components/pace-sheet/pace-sheet-preamble";

export default function PaceSheetPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return (
    <>
      <PaceSheetPreamble />
      <PaceSheet league={params.league} year={parseInt(params.year)} />
    </>
  );
}
