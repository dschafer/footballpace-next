import type { MetadataRoute } from "next";

import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";
import year from "@/lib/const/year";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const leagueSitemaps: MetadataRoute.Sitemap[] = await Promise.all(
    Array.from(leagues).map(async ([leagueCode]) => {
      const matches = await prisma.match.findMany({
        where: { league: leagueCode, year: year },
        orderBy: { date: "desc" },
      });
      const lastModified = matches[0]?.date;
      const teamList = matches
        .map((match) => match.awayTeam)
        .concat(matches.map((match) => match.homeTeam));

      const teamSitemaps: MetadataRoute.Sitemap = Array.from(
        new Set(teamList),
      ).map((team) => ({
        url: `https://footballpace.com/${leagueCode}/${year}/team/${team}`,
        changeFrequency: "daily",
        lastModified,
      }));
      return [
        {
          url: `https://footballpace.com/${leagueCode}/${year}`,
          changeFrequency: "daily",
          lastModified,
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/chart`,
          changeFrequency: "daily",
          lastModified,
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/explanation`,
          changeFrequency: "daily",
          lastModified,
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/matches`,
          changeFrequency: "daily",
          lastModified,
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/upcoming`,
          changeFrequency: "daily",
          lastModified,
        },
        ...teamSitemaps,
      ];
    }),
  );
  const allLeagueSitemaps = leagueSitemaps.flat();
  let lastModified = undefined;
  for (const le of allLeagueSitemaps) {
    if (!lastModified || (le.lastModified && le.lastModified > lastModified)) {
      lastModified = le.lastModified;
    }
  }
  return [
    {
      url: "https://footballpace.com",
      changeFrequency: "daily",
      lastModified,
    },
    {
      url: "https://footballpace.com/about",
      changeFrequency: "yearly",
    },
    ...allLeagueSitemaps,
  ];
}
