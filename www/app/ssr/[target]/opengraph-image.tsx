import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";

export const dynamic = "force-dynamic";

export function generateImageMetadata() {
  return imageMetadata();
}

export default async function Image() {
  return await genOpenGraphImage();
}
