import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";

export function generateImageMetadata() {
  return imageMetadata();
}

export default async function Image() {
  return await genOpenGraphImage();
}
