import prisma from '@/lib/prisma'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

type StandingsRow = {
  w: number;
  l: number;
  d: number;
  f: number
  a: number
};

export default async function StandingsTable() {
  const matches = await prisma.matches.findMany({ where: { League: "E0", Season: 2023 } })
  const standings: Map<string, StandingsRow> = new Map()
  for (const match of matches) {
    if (!standings.has(match.HomeTeam)) {
      standings.set(match.HomeTeam, { w: 0, l: 0, d: 0, f: 0, a: 0 })
    }
    if (!standings.has(match.AwayTeam)) {
      standings.set(match.AwayTeam, { w: 0, l: 0, d: 0, f: 0, a: 0 })
    }

    standings.get(match.HomeTeam)!.f = standings.get(match.HomeTeam)!.f + match.FTHG
    standings.get(match.HomeTeam)!.a = standings.get(match.HomeTeam)!.a + match.FTAG
    standings.get(match.AwayTeam)!.f = standings.get(match.AwayTeam)!.f + match.FTAG
    standings.get(match.AwayTeam)!.a = standings.get(match.AwayTeam)!.a + match.FTHG

    switch (match.FTR) {
      case "H":
        standings.get(match.HomeTeam)!.w = standings.get(match.HomeTeam)!.w + 1
        standings.get(match.AwayTeam)!.l = standings.get(match.AwayTeam)!.l + 1
        break
      case "A":
        standings.get(match.HomeTeam)!.l = standings.get(match.HomeTeam)!.l + 1
        standings.get(match.AwayTeam)!.w = standings.get(match.AwayTeam)!.w + 1
        break
      case "D":
        standings.get(match.HomeTeam)!.d = standings.get(match.HomeTeam)!.d + 1
        standings.get(match.AwayTeam)!.d = standings.get(match.AwayTeam)!.d + 1
        break
    }
  }

  const pts = (r: StandingsRow) => r.w * 2 + r.d
  const gd = (r: StandingsRow) => r.f - r.a

  const sortedStandings = Array.from(standings.entries()).sort(([_a, a], [_b, b]) => pts(b) - pts(a) || gd(b) - gd(a) || b.f - a.f)

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Played</TableCell>
            <TableCell>Won</TableCell>
            <TableCell>Drawn</TableCell>
            <TableCell>Lost</TableCell>
            <TableCell>For</TableCell>
            <TableCell>Against</TableCell>
            <TableCell>GD</TableCell>
            <TableCell>Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedStandings.map(([team, row], i) => (
            <TableRow key={team}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{team}</TableCell>
              <TableCell>{row.w + row.d + row.l}</TableCell>
              <TableCell>{row.w}</TableCell>
              <TableCell>{row.d}</TableCell>
              <TableCell>{row.l}</TableCell>
              <TableCell>{row.f}</TableCell>
              <TableCell>{row.a}</TableCell>
              <TableCell>{gd(row)}</TableCell>
              <TableCell>{pts(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
