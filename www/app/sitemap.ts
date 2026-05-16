import type { MetadataRoute } from "next";
import { fetchCachedTeams } from "@/lib/pace/data";
import leagues from "@/lib/const/leagues";
import { teamPath } from "@/lib/url/team-links";
import year from "@/lib/const/year";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const leagueSitemaps: MetadataRoute.Sitemap[] = await Promise.all(
    Array.from(leagues).map(async ([leagueCode, league]) => {
      const teams = await fetchCachedTeams(leagueCode, year, {
        orderBy: { team: "asc" },
      });

      const teamSitemaps: MetadataRoute.Sitemap = teams.map(({ team }) => ({
        url: `https://footballpace.com${teamPath(leagueCode, year, team)}`,
        changeFrequency: "weekly",
      }));
      const leagueUrls: MetadataRoute.Sitemap = [
        {
          url: `https://footballpace.com/${leagueCode}/${year}`,
          changeFrequency: "daily",
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/chart`,
          changeFrequency: "daily",
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/explanation`,
          changeFrequency: "daily",
        },
        {
          url: `https://footballpace.com/${leagueCode}/${year}/matches`,
          changeFrequency: "daily",
        },
      ];
      if (league.fixtures) {
        leagueUrls.push({
          url: `https://footballpace.com/${leagueCode}/${year}/upcoming`,
          changeFrequency: "daily",
        });
      }
      return [...leagueUrls, ...teamSitemaps];
    }),
  );
  const allLeagueSitemaps = leagueSitemaps.flat();
  return [
    {
      url: "https://footballpace.com",
      changeFrequency: "daily",
    },
    {
      url: "https://footballpace.com/about",
      changeFrequency: "yearly",
    },
    ...allLeagueSitemaps,
  ];
}
