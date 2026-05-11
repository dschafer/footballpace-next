import type { MetadataRoute } from "next";
import { fetchCachedMatches } from "@/lib/pace/data";
import leagues from "@/lib/const/leagues";
import { teamPath } from "@/lib/url/team-links";
import year from "@/lib/const/year";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const leagueSitemaps: MetadataRoute.Sitemap[] = await Promise.all(
    Array.from(leagues).map(async ([leagueCode, league]) => {
      const matches = await fetchCachedMatches(leagueCode, year, {
        orderBy: { date: "desc" },
      });
      const lastModified = matches[0]?.date;
      const teamList = matches
        .map((match) => match.awayTeam)
        .concat(matches.map((match) => match.homeTeam));

      const teamSitemaps: MetadataRoute.Sitemap = Array.from(
        new Set(teamList),
      ).map((team) => ({
        url: `https://footballpace.com${teamPath(leagueCode, year, team)}`,
        changeFrequency: "daily",
        lastModified,
      }));
      const leagueUrls: MetadataRoute.Sitemap = [
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
      ];
      if (league.fixtures) {
        leagueUrls.push({
          url: `https://footballpace.com/${leagueCode}/${year}/upcoming`,
          changeFrequency: "daily",
          lastModified,
        });
      }
      return [...leagueUrls, ...teamSitemaps];
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
