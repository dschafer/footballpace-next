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

export default async function FixturesTable({
  league,
  year,
  team,
}: {
  league: string;
  year: number;
  team: string;
}) {
  const matches = await prisma.matches.findMany({
    where: {
      League: league,
      Season: year,
      OR: [{ HomeTeam: team }, { AwayTeam: team }],
    },
  });

  return (
    <>
      <Typography variant="h4" gutterBottom>
        <Link href={`/leagueyear/${league}/${year}`}>
          {leagues.get(league)} {year}
        </Link>
      </Typography>
      <Typography variant="h5" gutterBottom>
        {team}
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left">Date</TableCell>
              <TableCell align="right">Home</TableCell>
              <TableCell align="center">Result</TableCell>
              <TableCell align="left">Away</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match, i) => (
              <TableRow key={i}>
                <TableCell align="left">
                  {match.Date.toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Link href={`/season/${league}/${year}/${match.HomeTeam}`}>
                    {match.HomeTeam}
                  </Link>
                </TableCell>
                <TableCell align="center">
                  {match.FTHG} - {match.FTAG}
                </TableCell>
                <TableCell align="left">
                  <Link href={`${league}/${year}/${match.AwayTeam}`}>
                    {match.AwayTeam}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
