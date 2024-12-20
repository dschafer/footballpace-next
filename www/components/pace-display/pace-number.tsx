import { NumberFormatter } from "@mantine/core";

export default function PaceNumber({ pace }: { pace: number }) {
  return (
    <>
      {pace > 0 ? "+" : pace < 0 ? "−" : ""}
      <NumberFormatter
        value={Math.abs(pace)}
        decimalScale={2}
        fixedDecimalScale
      />
    </>
  );
}
