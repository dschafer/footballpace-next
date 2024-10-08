"use client";
import {
  TableTd,
  TableTdProps,
  isLightColor,
  useComputedColorScheme,
} from "@mantine/core";

export default function ColoredCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  if (props.val < -3 || props.val > 3) {
    throw Error(
      `Invalid value passed to ColoredCell; must be in [-3, 3], got: {props.val}`,
    );
  }

  const computedColorScheme = useComputedColorScheme("light");

  if (computedColorScheme == "light") {
    const bgColors = [
      "#762a83",
      "#af8dc3",
      "#e7d4e8",
      "#f7f7f7",
      "#d9f0d3",
      "#7fbf7b",
      "#1b7837",
    ];
    const bg = (delta: number) => bgColors[Math.floor(delta + 3.5)];
    const fg = (delta: number) => (isLightColor(bg(delta)) ? "black" : "white");

    return (
      <TableTd p="0" bg={bg(props.val)} c={fg(props.val)} {...props}>
        {props.children}
      </TableTd>
    );
  } else {
    const bgColors = [
      "#762a83",
      "#5b2863",
      "#3f2644",
      "#242424",
      "#21402a",
      "#1e5d31",
      "#1b7837",
    ];
    const bg = (delta: number) => bgColors[Math.floor(delta + 3.5)];
    const fg = (delta: number) => (isLightColor(bg(delta)) ? "black" : "white");

    return (
      <TableTd p="0" bg={bg(props.val)} c={fg(props.val)} {...props}>
        {props.children}
      </TableTd>
    );
  }
}
