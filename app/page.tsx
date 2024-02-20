import { Suspense } from 'react'
import Table from '@/components/table'
import TablePlaceholder from '@/components/table-placeholder'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <Suspense fallback={<TablePlaceholder />}>
        <Table />
      </Suspense>
    </main>
  )
}
