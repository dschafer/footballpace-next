import { NumberFormatter } from "@mantine/core";

export default function PaceNumber({ pace }: { pace: number }) {
  return (
    <>
      {pace > 0 ? "+" : ""}
      <NumberFormatter value={pace} decimalScale={2} fixedDecimalScale />
    </>
  );
}
