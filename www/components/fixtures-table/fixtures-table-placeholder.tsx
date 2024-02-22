import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export default async function FixturesTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        <Skeleton variant="text" />
      </Typography>
      <Typography variant="h5" gutterBottom>
        <Skeleton variant="text" />
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Home</TableCell>
              <TableCell align="right">Away</TableCell>
              <TableCell align="center">Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(rowCount)].map((_, i) => (
              <TableRow key={i}>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="center">
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
