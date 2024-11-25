"use client";
import { TableTd, type TableTdProps } from "@mantine/core";
import usePaceDeltaColor from "./use-pace-color";

export default function ColoredCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  const { val, ...rest } = props;
  const [bg, fg] = usePaceDeltaColor(val);

  return (
    <TableTd p="0" bg={bg} c={fg} {...rest}>
      {props.children}
    </TableTd>
  );
}
