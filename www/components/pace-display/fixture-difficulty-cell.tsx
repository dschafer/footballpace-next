"use client";
import { TableTd, TableTdProps } from "@mantine/core";
import useFixtureDifficultyColor from "./use-fixture-difficulty-color";

export default function FixtureDifficultyCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  const [bg, fg] = useFixtureDifficultyColor(props.val);

  return (
    <TableTd bg={bg} c={fg} {...props}>
      {props.children}
    </TableTd>
  );
}
