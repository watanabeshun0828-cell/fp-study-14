import { X, Check, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

export function Dialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const el = ref.current; el?.showModal(); return () => el?.close() }, [])
  return <dialog ref={ref} className="dialog" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close() }} aria-labelledby="dialog-title">
    <div className="dialog-head"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="閉じる" onClick={close}><X size={21} /></button></div>{children}
  </dialog>
}
export function Progress({ value, label }: { value: number; label: string }) {
  return <div className="progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }} /></div>
}
export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty"><div className="empty-icon"><Sparkles /></div><h2>{title}</h2><p>{children}</p>{action}</div>
}
export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{children}</div>
}
export function FinanceArtwork() {
  return <svg className="book-art" viewBox="0 0 320 240" fill="none" aria-hidden="true">
    <circle cx="177" cy="116" r="104" stroke="#dbf5e8" strokeOpacity=".14" />
    <circle cx="177" cy="116" r="86" fill="#629c83" fillOpacity=".2" />
    <rect x="68" y="48" width="174" height="138" rx="17" transform="rotate(-12 68 48)" fill="#d5f0e3" />
    <path d="m95 154 30-43 29 20 38-49 23 7" stroke="#198263" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M106 145v25m27-39v32m29-37v31m29-54v48" stroke="#71b898" strokeWidth="4" strokeLinecap="round" />
    <rect x="195" y="83" width="69" height="112" rx="14" transform="rotate(13 195 83)" fill="#246954" stroke="#aff0d2" strokeWidth="4" />
    <rect x="204" y="98" width="43" height="23" rx="6" transform="rotate(13 204 98)" fill="#a8e6c9" />
    <path d="m207 137 8 2m14 3 8 2m-34 8 8 2m14 3 8 2m-34 8 8 2m14 3 8 2" stroke="#d3f4e5" strokeWidth="5" strokeLinecap="round" />
    <circle cx="111" cy="189" r="26" fill="#ffde98" stroke="#bf9c50" strokeWidth="4" />
    <path d="m104 182 7 7 7-7m-7 7v11m-7-10h14m-14 5h14" stroke="#775224" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
export const NextIcon = () => <ArrowRight size={18} />
export function ReadBadge({ read }: { read: boolean }) { return read ? <span className="tag success"><Check size={13} />読了</span> : <span className="tag"><BookOpen size={13} />未読</span> }
