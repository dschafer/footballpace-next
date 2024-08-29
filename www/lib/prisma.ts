import { PrismaClient } from "@prisma/client";

const extendedClient = new PrismaClient().$extends({
  result: {
    standingsRow: {
      played: {
        needs: { wins: true, losses: true, draws: true },
        compute(standingsRow) {
          return standingsRow.wins + standingsRow.losses + standingsRow.draws;
        },
      },
      points: {
        needs: { wins: true, draws: true },
        compute(standingsRow) {
          return 3 * standingsRow.wins + standingsRow.draws;
        },
      },
      gd: {
        needs: { goalsFor: true, goalsAgainst: true },
        compute(standingsRow) {
          return standingsRow.goalsFor - standingsRow.goalsAgainst;
        },
      },
    },
  },
});

declare global {
  var prisma: typeof extendedClient | undefined;
}

const prisma = global.prisma || extendedClient;
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
