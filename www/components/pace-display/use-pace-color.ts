"use client";
import { isLightColor, useComputedColorScheme } from "@mantine/core";

export default function usePaceDeltaColor(paceDelta: number): [string, string] {
  if (paceDelta < -3 || paceDelta > 3) {
    throw Error(
      `Invalid value passed to usePaceDeltaColor; must be in [-3, 3], got: {paceDelta}`,
    );
  }

  const computedColorScheme = useComputedColorScheme("light");
  // https://github.com/jthomasmock/gtExtras/blob/HEAD/R/gt_hulk_color.R
  // https://colordesigner.io/gradient-generator/?mode=srgb#762A83-F7F7F7
  // https://colordesigner.io/gradient-generator/?mode=srgb#F7F7F7-1b7837
  let bgColors = [
    "#762a83", // [-3.0, -2.5)
    "#8c4c96", // [-2.5, -2.0)
    "#a16eaa", // [-2.0, -1.5)
    "#b791bd", // [-1.5, -1.0)
    "#ccb3d0", // [-1.0, -0.5)
    "#e2d5e4", // [-0.5, -0.0)
    "#f7f7f7", // [0.0, 0.5)
    "#aecdb7", // [0.5, 1.0)
    "#64a277", // [1.0, 1.5)
    "#1b7837", // [1.5, 2.0)
    "#1b7837", // [2.0, 2.5)
    "#1b7837", // [2.5, 3.0)
  ];

  if (computedColorScheme == "dark") {
    // https://github.com/jthomasmock/gtExtras/blob/HEAD/R/gt_hulk_color.R
    // https://colordesigner.io/gradient-generator/?mode=srgb#762A83-242424
    // https://colordesigner.io/gradient-generator/?mode=srgb#242424-1b7837
    bgColors = [
      "#762a83", // [-3.0, -2.5)
      "#682973", // [-2.5, -2.0)
      "#5b2863", // [-2.0, -1.5)
      "#4d2753", // [-1.5, -1.0)
      "#3f2644", // [-1.0, -0.5)
      "#322534", // [-0.5, -0.0)
      "#242424", // [0.0, 0.5)
      "#21402a", // [0.5, 1.0)
      "#1e5d31", // [1.0, 1.5)
      "#1b7837", // [1.5, 2.0)
      "#1b7837", // [2.0, 2.5)
      "#1b7837", // [2.5, 3.0)
    ];
  }
  const bg = bgColors[Math.floor(paceDelta * 2) + 6];
  const fg = isLightColor(bg) ? "black" : "white";

  return [bg, fg];
}
