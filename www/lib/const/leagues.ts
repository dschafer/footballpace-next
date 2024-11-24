export type LeagueInfo = {
  name: string;
  flag: string;
  flagImage: string;
  tz: string;
  fixtures: boolean;
};

export const leagues: Map<string, LeagueInfo> = new Map([
  [
    "E0",
    {
      name: "English Premier League",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      flagImage: "/flags/E0.png",
      tz: "Europe/London",
      fixtures: true,
    },
  ],
  [
    "SP1",
    {
      name: "La Liga 1",
      flag: "🇪🇸",
      flagImage: "/flags/SP1.png",
      tz: "Europe/Madrid",
      fixtures: false,
    },
  ],
  [
    "D1",
    {
      name: "Bundesliga 1",
      flag: "🇩🇪",
      flagImage: "/flags/D1.png",
      tz: "Europe/Berlin",
      fixtures: false,
    },
  ],
  [
    "F1",
    {
      name: "Ligue 1",
      flag: "🇫🇷",
      flagImage: "/flags/F1.png",
      tz: "Europe/Paris",
      fixtures: false,
    },
  ],
  [
    "I1",
    {
      name: "Serie A",
      flag: "🇮🇹",
      flagImage: "/flags/I1.png",
      tz: "Europe/Rome",
      fixtures: false,
    },
  ],
]);
export default leagues;
