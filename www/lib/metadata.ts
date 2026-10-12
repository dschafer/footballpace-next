import type { Metadata } from "next/types";
import { imageMetadata } from "@/components/opengraph-image/opengraph-image";

export const openGraphMetadata: Metadata["openGraph"] = {
  type: "website",
  title: {
    default: "Football Pace",
    template: "%s | Football Pace",
  },
  siteName: "Football Pace",
  description: "Reimagining football tables using historical championship pace",
  url: "./",
};

export const twitterMetadata: Metadata["twitter"] = {
  card: "summary_large_image",
  title: {
    default: "Football Pace",
    template: "%s | Football Pace",
  },
  description: "Reimagining football tables using historical championship pace",
  site: "@fballpace",
  siteId: "1856718770712236032",
  creator: "@dlschafer",
  creatorId: "69042390",
};

export function socialImageMetadata(
  metadata: Pick<Metadata, "openGraph" | "twitter">,
  url: string,
  subtitle?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const [{ contentType, size, alt }] = imageMetadata(subtitle);
  const images = [{ url, type: contentType, ...size, alt }];
  return {
    openGraph: { ...metadata.openGraph, images },
    twitter: { ...metadata.twitter, images },
  };
}
