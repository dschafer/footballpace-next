import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export default async function StandingsTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        <Skeleton variant="text" />
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
            {[...Array(rowCount)].map((_, i) => (
              <TableRow key={i}>
                <TableCell align="center">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: "bold" }}>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  <Skeleton variant="text" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
