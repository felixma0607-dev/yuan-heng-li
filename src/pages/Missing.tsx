import { Link } from 'react-router-dom'

export function Missing() {
  return (
    <article className="page">
      <h1>冇呢一頁</h1>
      <Link to="/">返回首頁</Link>
    </article>
  )
}
