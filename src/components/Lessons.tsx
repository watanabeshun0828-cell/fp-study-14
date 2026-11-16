import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, ExternalLink, Lightbulb, Target } from 'lucide-react'
import { courses, curriculum } from '../data'
import { useStudy } from '../lib/store'
import { addActivity, type Page } from '../lib/study'
import { Progress, ReadBadge } from './Shared'

export default function Lessons({ navigate }: { navigate: (p: Page) => void }) {
  const { state, update } = useStudy()
  const course = courses.find(c => c.day === state.selectedDay) ?? courses[0]
  const position = Math.min(state.lessonPositions[course.id] ?? 0, course.sections.length - 1)
  const section = course.sections[position]
  const read = course.sections.filter(s => state.readSections.includes(s.id)).length
  const go = (index: number) => { update(s => ({ ...s, lessonPositions: { ...s.lessonPositions, [course.id]: index }, lastStudy: 'lessons' })); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const mark = () => {
    update(s => ({ ...s, readSections: [...new Set([...s.readSections, section.id])], activityDates: addActivity(s), lastStudy: 'lessons', lessonPositions: { ...s.lessonPositions, [course.id]: Math.min(position + 1, course.sections.length - 1) } }))
    if (position === course.sections.length - 1) navigate('quiz')
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return <><div className="page-intro"><div><p className="eyebrow">LESSON NOTE</p><h1>ひとつずつ、理解する。</h1><p className="muted">大切なポイントを、自分のペースで。</p></div><label className="select-label">学習する日<select value={course.day} onChange={e => update(s => ({ ...s, selectedDay: Number(e.target.value), lastAttemptId: null }))}>{curriculum.map(item => <option key={item.day} value={item.day} disabled={!item.course}>Day {item.day} · {item.course?.title ?? `${item.title}（準備中）`}</option>)}</select></label></div>
  <div className="lesson-layout"><aside className="panel chapter-nav"><p className="eyebrow">DAY {String(course.day).padStart(2, '0')}</p><h2>{course.title}</h2><div className="lesson-meta"><span><Clock3 size={15} />約{course.minutes}分</span><span>{read}/{course.sections.length}章 読了</span></div><Progress value={read / course.sections.length * 100} label="講義の読了率" /><nav aria-label="講義の章">{course.sections.map((s, i) => <button key={s.id} className={i === position ? 'active' : ''} onClick={() => go(i)} aria-current={i === position ? 'step' : undefined}><span className={`chapter-number ${state.readSections.includes(s.id) ? 'read' : ''}`}>{state.readSections.includes(s.id) ? <CheckCircle2 size={18} /> : `0${i + 1}`}</span><span>{s.title}</span></button>)}</nav><button className="text-button" onClick={() => navigate('quiz')}><Target size={17} />確認テストへ<ArrowRight size={16} /></button></aside>
  <article className="panel lesson-article"><div className="article-top"><span className="eyebrow">CHAPTER {String(position + 1).padStart(2, '0')} / {String(course.sections.length).padStart(2, '0')}</span><ReadBadge read={state.readSections.includes(section.id)} /></div><h2>{section.title}</h2>{position === 0 && <div className="objectives"><span><BookOpen size={18} />今日のゴール</span><ul>{course.objectives.map(goal => <li key={goal}>{goal}</li>)}</ul></div>}<div className="prose">{section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
  {section.diagram && <figure className={`lesson-diagram ${section.diagram.kind === 'nested' ? 'nested-diagram' : ''}`}><figcaption>{section.diagram.title}</figcaption><div className="diagram-items">{section.diagram.items.map((item, i) => <div className="diagram-item" key={item.label}><span className="small">0{i + 1}</span><strong>{item.label}</strong><span>{item.detail}</span></div>)}</div></figure>}
  <div className="key-point"><span><Lightbulb size={20} />ここがポイント</span><p>{section.keyPoint}</p></div><div className="article-actions"><button className="button secondary" disabled={position === 0} onClick={() => go(position - 1)}><ArrowLeft size={17} />前の章</button><button className="button primary" onClick={mark}>{position === course.sections.length - 1 ? '読了してテストへ' : '読了して次の章へ'}<ArrowRight size={17} /></button></div><p className="small muted autosave-note">読んだ章と学習位置は、この端末に自動保存されます。</p>{course.sources && <details className="lesson-sources"><summary>参考資料（オンライン）</summary><ul>{course.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ExternalLink size={15} aria-hidden="true" /></a></li>)}</ul></details>}</article></div></>
}
