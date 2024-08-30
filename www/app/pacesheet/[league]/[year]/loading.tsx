import PaceSheetPlaceholder from "@/components/pace-sheet/pace-sheet-placeholder";
import PaceSheetPreamble from "@/components/pace-sheet/pace-sheet-preamble";

export default function PaceSheetLoading() {
  return (
    <>
      <PaceSheetPreamble />
      <PaceSheetPlaceholder teamCount={20} />
    </>
  );
}
