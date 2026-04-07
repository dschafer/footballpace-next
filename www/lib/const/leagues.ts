export interface LeagueInfo {
  name: string;
  flag: string;
  flagImage: string;
  tz: string;
  fixtures: boolean;
  relegationSafetyPosition: number;
}

export const leagues = new Map<string, LeagueInfo>([
  [
    "E0",
    {
      name: "English Premier League",
      flag: "🏴",
      flagImage: "/flags/E0.png",
      tz: "Europe/London",
      fixtures: true,
      relegationSafetyPosition: 17,
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
      relegationSafetyPosition: 17,
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
      relegationSafetyPosition: 15,
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
      relegationSafetyPosition: 15,
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
      relegationSafetyPosition: 17,
    },
  ],
]);
export default leagues;
