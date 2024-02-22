import Link from "next/link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import leagues from "@/lib/leagues";
import prisma from "@/lib/prisma";

type StandingsRow = {
  w: number;
  l: number;
  d: number;
  f: number;
  a: number;
};

export default async function StandingsTable({
  rowCount,
  league,
  season,
}: {
  rowCount?: number;
  league: string;
  season: number;
}) {
  const matches = await prisma.matches.findMany({
    where: { League: league, Season: season },
  });
  if (matches.length == 0) {
    return null;
  }
  const standings: Map<string, StandingsRow> = new Map();
  for (const match of matches) {
    if (!standings.has(match.HomeTeam)) {
      standings.set(match.HomeTeam, { w: 0, l: 0, d: 0, f: 0, a: 0 });
    }
    if (!standings.has(match.AwayTeam)) {
      standings.set(match.AwayTeam, { w: 0, l: 0, d: 0, f: 0, a: 0 });
    }

    standings.get(match.HomeTeam)!.f =
      standings.get(match.HomeTeam)!.f + match.FTHG;
    standings.get(match.HomeTeam)!.a =
      standings.get(match.HomeTeam)!.a + match.FTAG;
    standings.get(match.AwayTeam)!.f =
      standings.get(match.AwayTeam)!.f + match.FTAG;
    standings.get(match.AwayTeam)!.a =
      standings.get(match.AwayTeam)!.a + match.FTHG;

    switch (match.FTR) {
      case "H":
        standings.get(match.HomeTeam)!.w = standings.get(match.HomeTeam)!.w + 1;
        standings.get(match.AwayTeam)!.l = standings.get(match.AwayTeam)!.l + 1;
        break;
      case "A":
        standings.get(match.HomeTeam)!.l = standings.get(match.HomeTeam)!.l + 1;
        standings.get(match.AwayTeam)!.w = standings.get(match.AwayTeam)!.w + 1;
        break;
      case "D":
        standings.get(match.HomeTeam)!.d = standings.get(match.HomeTeam)!.d + 1;
        standings.get(match.AwayTeam)!.d = standings.get(match.AwayTeam)!.d + 1;
        break;
    }
  }

  const pts = (r: StandingsRow) => r.w * 2 + r.d;
  const gd = (r: StandingsRow) => r.f - r.a;

  var sortedStandings = Array.from(standings.entries()).sort(
    ([_a, a], [_b, b]) => pts(b) - pts(a) || gd(b) - gd(a) || b.f - a.f,
  );
  if (rowCount) {
    sortedStandings = sortedStandings.slice(0, rowCount);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {leagues.get(league)}
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="left" sx={{ fontWeight: "bold" }}>
                Team
              </TableCell>
              <TableCell align="right">Played</TableCell>
              <TableCell align="right">Won</TableCell>
              <TableCell align="right">Drawn</TableCell>
              <TableCell align="right">Lost</TableCell>
              <TableCell align="right">For</TableCell>
              <TableCell align="right">Against</TableCell>
              <TableCell align="right">GD</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Points
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStandings.map(([team, row], i) => (
              <TableRow key={team}>
                <TableCell align="center">{i + 1}</TableCell>
                <TableCell align="left" sx={{ fontWeight: "bold" }}>
                  <Link href={`${league}/${season}/${team}`}>{team}</Link>
                </TableCell>
                <TableCell align="right">{row.w + row.d + row.l}</TableCell>
                <TableCell align="right">{row.w}</TableCell>
                <TableCell align="right">{row.d}</TableCell>
                <TableCell align="right">{row.l}</TableCell>
                <TableCell align="right">{row.f}</TableCell>
                <TableCell align="right">{row.a}</TableCell>
                <TableCell align="right">{gd(row)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {pts(row)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
