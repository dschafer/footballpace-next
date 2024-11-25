import type { Metadata } from "next/types";

export const openGraphMetadata: Metadata["openGraph"] = {
  type: "website",
  title: {
    default: "Football Pace",
    template: "%s | Football Pace",
  },
  siteName: "Football Pace",
  description: "Reimagining football tables using historical championship pace",
  url: "https://footballpace.com",
  images: {
    url: "https://footballpace.com/opengraph-image.png",
    width: 1200,
    height: 630,
  },
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
  images: {
    url: "https://footballpace.com/twitter-image.png",
    width: 1200,
    height: 630,
  },
};
