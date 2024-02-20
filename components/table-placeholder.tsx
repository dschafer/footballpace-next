export default function TablePlaceholder() {
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
        {[...Array(3)].map((_, i) => (
          <tr key={i}>
            <td>...</td>
            <td>...</td>
            <td>...</td>
            <td>...</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
