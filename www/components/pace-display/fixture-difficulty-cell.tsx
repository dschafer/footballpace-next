"use client";
import { TableTd, type TableTdProps } from "@mantine/core";
import useFixtureDifficultyColor from "./use-fixture-difficulty-color";

export default function FixtureDifficultyCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  const { val, ...rest } = props;
  const [bg, fg] = useFixtureDifficultyColor(val);

  return (
    <TableTd bg={bg} c={fg} {...rest}>
      {props.children}
    </TableTd>
  );
}
