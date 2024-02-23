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

export default async function StandingsTable({
  rowCount,
  league,
  year,
}: {
  rowCount?: number;
  league: string;
  year: number;
}) {
  const standings = await prisma.standingsRow.findMany({
    where: { league: league, year: year },
  });
  if (standings.length == 0) {
    return null;
  }

  var sortedStandings = standings.sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.goalsFor - a.goalsFor,
  );
  if (rowCount) {
    sortedStandings = sortedStandings.slice(0, rowCount);
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        <Link href={`/leagueyear/${league}/${year}`}>
          {leagues.get(league)} {year}
        </Link>
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
            {sortedStandings.map((row, i) => (
              <TableRow key={row.team}>
                <TableCell align="center">{i + 1}</TableCell>
                <TableCell align="left" sx={{ fontWeight: "bold" }}>
                  <Link href={`/season/${league}/${year}/${row.team}`}>
                    {row.team}
                  </Link>
                </TableCell>
                <TableCell align="right">{row.played}</TableCell>
                <TableCell align="right">{row.wins}</TableCell>
                <TableCell align="right">{row.draws}</TableCell>
                <TableCell align="right">{row.losses}</TableCell>
                <TableCell align="right">{row.goalsFor}</TableCell>
                <TableCell align="right">{row.goalsAgainst}</TableCell>
                <TableCell align="right">{row.gd}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {row.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
