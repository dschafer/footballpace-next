"use client";
import { TableTd, TableTdProps } from "@mantine/core";
import usePaceDeltaColor from "./use-pace-color";

export default function ColoredCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  const [bg, fg] = usePaceDeltaColor(props.val);

  return (
    <TableTd p="0" bg={bg} c={fg} {...props}>
      {props.children}
    </TableTd>
  );
}
