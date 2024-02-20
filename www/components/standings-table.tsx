import prisma from '@/lib/prisma'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default async function StandingsTable() {
  const matches = await prisma.matches.findMany({ take: 10, where: { League: "E0" } })

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Home</TableCell>
            <TableCell>Away</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match, i) => (
            <TableRow key={i}>
              <TableCell>{match.Date.toDateString()}</TableCell>
              <TableCell>{match.HomeTeam}</TableCell>
              <TableCell>{match.AwayTeam}</TableCell>
              <TableCell>{match.FTHG}–{match.FTAG}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
