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

export default async function PaceSheet({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const paceSheetEntries = await prisma.paceSheetEntry.findMany({
    where: { league: league, year: year, teamFinish: 1 },
  });
  if (paceSheetEntries.length == 0) {
    return null;
  }

  const homePace = [...Array(paceSheetEntries.length / 2)];
  const awayPace = [...Array(paceSheetEntries.length / 2)];
  for (const entry of paceSheetEntries) {
    if (entry.home) {
      homePace[entry.opponentFinish - 1] = entry.expectedPoints;
    } else {
      awayPace[entry.opponentFinish - 1] = entry.expectedPoints;
    }
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
              <TableCell align="center">Opponent Position</TableCell>
              <TableCell align="right">Home</TableCell>
              <TableCell align="right">Away</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(paceSheetEntries.length / 2)].map((_, i) => (
              <TableRow key={i}>
                <TableCell align="center">{i + 1}</TableCell>
                <TableCell align="right">{i == 0 ? "" : homePace[i]}</TableCell>
                <TableCell align="right">{i == 0 ? "" : awayPace[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
