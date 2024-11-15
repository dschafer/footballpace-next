"use client";
import {
  TableTd,
  TableTdProps,
  isLightColor,
  useComputedColorScheme,
} from "@mantine/core";

export default function FixtureDifficultyCell(
  props: {
    val: number;
    children: React.ReactNode;
  } & TableTdProps,
) {
  if (props.val < 0 || props.val > 3) {
    throw Error(
      `Invalid value passed to FixtureDifficultyCell; must be in [0, 3], got: {props.val}`,
    );
  }

  const computedColorScheme = useComputedColorScheme("light");
  // https://github.com/jthomasmock/gtExtras/blob/HEAD/R/gt_hulk_color.R
  // https://colordesigner.io/gradient-generator/?mode=srgb#762A83-F7F7F7
  // https://colordesigner.io/gradient-generator/?mode=srgb#F7F7F7-1b7837
  let bgColors = [
    "#762a83",
    "#8c4c96",
    "#a16eaa",
    "#b791bd",
    "#ccb3d0",
    "#e2d5e4",
    "#f7f7f7",
    "#d2e2d7",
    "#aecdb7",
    "#89b897",
    "#64a377",
    "#408e57",
    "#1b7937",
  ];

  if (computedColorScheme == "dark") {
    // https://github.com/jthomasmock/gtExtras/blob/HEAD/R/gt_hulk_color.R
    // https://colordesigner.io/gradient-generator/?mode=srgb#762A83-242424
    // https://colordesigner.io/gradient-generator/?mode=srgb#242424-1b7837
    bgColors = [
      "#762a83",
      "#682973",
      "#5b2863",
      "#4d2753",
      "#3f2644",
      "#322534",
      "#242424",
      "#233227",
      "#21402a",
      "#204f2e",
      "#1e5d31",
      "#1c6b34",
      "#1b7837",
    ];
  }

  const bg = (delta: number) =>
    bgColors[
      Math.floor(Math.max(delta - 1, 0) * ((bgColors.length - 0.55) / 2.0))
    ];
  const fg = (delta: number) => (isLightColor(bg(delta)) ? "black" : "white");

  return (
    <TableTd bg={bg(props.val)} c={fg(props.val)} {...props}>
      {props.children}
    </TableTd>
  );
}
