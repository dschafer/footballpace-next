import { Suspense } from 'react'
import StandingsTable from '@/components/standings-table'
import StandingsTablePlaceholder from '@/components/standings-table-placeholder'
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <>
      <Typography variant="h1" gutterBottom>Football Pace</Typography>
      <main>
        <Suspense fallback={<StandingsTablePlaceholder />}>
          <StandingsTable />
        </Suspense>
      </main>
    </>
  )
}

