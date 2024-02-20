import { Suspense } from 'react'
import StandingsTable from '@/components/standings-table'
import StandingsTablePlaceholder from '@/components/standings-table-placeholder'

export default function Home() {
  return (
    <main>
      <Suspense fallback={<StandingsTablePlaceholder />}>
        <StandingsTable />
      </Suspense>
    </main>
  )
}
