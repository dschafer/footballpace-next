import type { ImageResponse } from "next/og";
import { genOpenGraphImage } from "@/components/opengraph-image/opengraph-image";

export async function GET(): Promise<ImageResponse> {
  return genOpenGraphImage();
}
