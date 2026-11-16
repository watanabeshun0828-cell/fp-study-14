import { ClipboardList } from 'lucide-react'
import type { PracticeCase } from '../lib/content'

export default function CaseSheet({ data }: { data: PracticeCase }) {
  return <aside className="case-sheet" aria-label={`実技資料：${data.title}`}>
    <p className="case-kicker"><ClipboardList size={17} aria-hidden="true" /> 実技資料 · {data.route}</p>
    <h3>{data.title}</h3>
    <p>{data.intro}</p>
    <dl>{data.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
  </aside>
}
