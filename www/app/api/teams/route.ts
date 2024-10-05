import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// This can't be done with server components because the navlink
// has to be client (since it has a click handler to hide the menu),
// the shell has to be client (since it has the burger icon to hide
// the menu), and this lives in between, so having it be anything
// other than a client component is awkward.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get("league");
  const year = parseInt(searchParams.get("year") || "0");
  if (league == null || league == undefined || year == 0) {
    return Response.json(
      { message: "Missing required parameter" },
      {
        status: 400,
      },
    );
  }
  const standings = await prisma.standingsRow.findMany({
    where: { league: league, year: year },
    orderBy: { team: "asc" },
  });
  const teams = standings.map((r) => r.team);
  return Response.json(
    { data: teams },
    {
      status: 200,
    },
  );
}
