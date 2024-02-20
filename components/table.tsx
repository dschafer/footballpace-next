import prisma from '@/lib/prisma'

export default async function Table() {
  const matches = await prisma.matches.findMany({ take: 10 })

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Home</th>
          <th>Away</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {matches.map((match, i) => (
          <tr key={i}>
            <td>{match.Date.toDateString()}</td>
            <td>{match.HomeTeam}</td>
            <td>{match.AwayTeam}</td>
            <td>{match.FTHG}–{match.FTAG}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
