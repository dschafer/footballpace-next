"use client";
import {
  darken,
  isLightColor,
  lighten,
  useComputedColorScheme,
} from "@mantine/core";

export default function useFixtureDifficultyColor(
  fixtureDifficulty: number,
): [string, string] {
  if (fixtureDifficulty < 0 || fixtureDifficulty > 3) {
    throw Error(
      `Invalid value passed to FixtureDifficultyCell; must be in [0, 3], got: {props.val}`,
    );
  }
  const computedColorScheme = useComputedColorScheme("light");
  // https://colorbrewer2.org/?type=diverging&scheme=RdYlGn&n=11
  let bgColors = [
    "#a50026",
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#ffffbf",
    "#d9ef8b",
    "#a6d96a",
    "#66bd63",
    "#1a9850",
    "#006837",
  ];
  if (computedColorScheme == "dark") {
    bgColors = bgColors.map((x) => darken(x, 0.25));
  } else {
    bgColors = bgColors.map((x) => lighten(x, 0.25));
  }

  const bg =
    bgColors[
      Math.floor(
        Math.max(fixtureDifficulty - 1, 0) * ((bgColors.length - 0.55) / 2.0),
      )
    ];
  const fg = isLightColor(bg) ? "black" : "white";
  return [bg, fg];
}
