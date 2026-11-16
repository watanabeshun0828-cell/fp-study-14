import { useState } from 'react'
import { ArrowRight, BookOpen, Check, CheckCircle2, CircleHelp, RotateCcw, Target, Trophy, X } from 'lucide-react'
import { useCatalog } from '../data'
import { useGrade } from '../lib/grade-context'
import { useStudy } from '../lib/store'
import { accuracy, advanceQuiz, answerLabel, checkAnswer, createDraft, isDayComplete, parseNumericAnswer, wrongQuestions, type Page, type QuizDraft } from '../lib/study'
import { Dialog, Empty, Progress } from './Shared'
import CaseSheet from './CaseSheet'

export function useStartQuiz(navigate: (p: Page) => void) {
  const { state, update } = useStudy()
  const { courses, allQuestions } = useCatalog()
  const [pending, setPending] = useState<QuizDraft | null>(null)
  const begin = (draft: QuizDraft) => { update(s => ({ ...s, draft, lastAttemptId: null, lastStudy: 'quiz' })); setPending(null); navigate('quiz') }
  const start = (mode: 'test' | 'review', day: number) => {
    const questions = mode === 'test' ? courses.find(c => c.day === day)?.questions ?? [] : wrongQuestions(state, allQuestions)
    if (!questions.length) return
    const draft = createDraft(mode, day, questions)
    if (state.draft) setPending(draft)
    else begin(draft)
  }
  return { start, confirmation: pending && <Dialog title="途中の学習があります" close={() => setPending(null)}><p>新しく始めると、途中のテストの進行は置き換わります。確定済みの回答と復習待ちは保存されています。</p><div className="dialog-actions"><button className="button primary wide" onClick={() => { setPending(null); navigate('quiz') }}>途中から再開する</button><button className="button secondary wide" onClick={() => begin(pending)}>新しく開始する</button></div></Dialog> }
}

export default function Quiz({ navigate }: { navigate: (p: Page) => void }) {
  const { state, update } = useStudy()
  const { start, confirmation } = useStartQuiz(navigate)
  const { grade } = useGrade()
  const { caseMap, courses, curriculum, questionMap } = useCatalog()
  const draft = state.draft
  const course = courses.find(c => c.day === state.selectedDay) ?? courses[0]
  const last = state.attempts.find(a => a.id === state.lastAttemptId)
  const nextCourse = last?.mode === 'test' && accuracy(last.answers) >= 80 && isDayComplete(course, state)
    ? courses.find(c => c.day > course.day && !isDayComplete(c, state)) : undefined
  const current = draft ? questionMap.get(draft.questionIds[draft.index]) : null
  const validDraft = !draft || draft.questionIds.every(id => questionMap.has(id))
  return <>
  <div className={`page-intro ${draft ? 'quiz-intro-active' : ''}`}>
    <div>
      <p className="eyebrow">{draft?.mode === 'review' ? 'REVIEW SESSION' : 'KNOWLEDGE CHECK'}</p>
      <h1>{draft ? (draft.mode === 'review' ? '間違えた問題の復習' : `Day ${draft.day} 確認テスト`) : '学んだことを、力に。'}</h1>
      {!draft && <p className="muted">一問ずつ、解説を読みながら理解を深めましょう。</p>}
    </div>
    {!draft && <label className="select-label">テストを受ける日
      <select value={course.day} onChange={e => update(s => ({ ...s, selectedDay: Number(e.target.value), lastAttemptId: null }))}>
        {curriculum.map(item => <option key={item.day} value={item.day} disabled={!item.course}>Day {item.day} · {item.course?.title ?? `${item.title}（準備中）`}</option>)}
      </select>
    </label>}
  </div>
  {!validDraft ? <section className="panel"><Empty title="教材が更新されています" action={<button className="button primary" onClick={() => update(s => ({ ...s, draft: null }))}>テスト一覧へ戻る</button>}>途中の問題が教材に見つかりません。これまでの学習履歴は保持したまま、新しいテストを始められます。</Empty></section> : draft && current ? (() => {
    const answer = draft.answers.find(a => a.questionId === current.id)
    const caseStudy = current.caseId ? caseMap.get(current.caseId) : undefined
    const isChoice = 'choices' in current
    const canAnswer = isChoice ? draft.selected !== null : parseNumericAnswer(draft.input) !== null
    return <section className="panel quiz-panel"><div className="quiz-top"><span className="tag blue-tag">{current.category}</span><span className="muted small">QUESTION <strong>{String(draft.index + 1).padStart(2, '0')}</strong> / {String(draft.questionIds.length).padStart(2, '0')}</span></div><Progress value={(draft.index + (answer ? 1 : 0)) / draft.questionIds.length * 100} label="テストの進捗" /><h2 className="question-title">{current.prompt}</h2>{caseStudy && <CaseSheet data={caseStudy} />}{isChoice ? <fieldset className="choices" disabled={!!answer}><legend className="sr-only">回答を1つ選んでください</legend>{current.choices.map((choice, i) => <label key={choice} className={`choice ${draft.selected === i ? 'selected' : ''} ${answer && i === current.correctIndex ? 'correct' : ''} ${answer && i === answer.selected && !answer.correct ? 'incorrect' : ''}`}><input type="radio" name="answer" value={i} checked={draft.selected === i} onChange={() => update(s => s.draft ? ({ ...s, draft: { ...s.draft, selected: i } }) : s)} /><span className="choice-letter">{i + 1}</span><span>{choice}</span>{answer && i === current.correctIndex ? <Check size={20} /> : answer && i === answer.selected && !answer.correct ? <X size={20} /> : <span className="radio-indicator" />}</label>)}</fieldset> : <label className="number-answer">
      <span>回答を入力</span>
      <span className="number-answer-field">
        <input type="text" inputMode={current.solution < 0 ? 'text' : 'decimal'} autoComplete="off" spellCheck={false} disabled={!!answer}
          value={draft.input ?? ''} onChange={event => {
            const input = event.target.value
            update(s => s.draft ? { ...s, draft: { ...s.draft, input } } : s)
          }} />
        <span aria-hidden="true">{current.unit}</span>
      </span>
      <span className="sr-only">単位 {current.unit}</span>
    </label>}
    {answer && <div className={`explanation ${answer.correct ? 'is-correct' : 'is-incorrect'}`} role="status"><h3>{answer.correct ? <CheckCircle2 size={21} /> : <CircleHelp size={21} />}{answer.correct ? '正解です！' : 'ここで覚えれば、大丈夫。'}</h3><p className="answer-key">正解：{answerLabel(current, isChoice ? current.correctIndex : current.solution)}</p><p>{current.explanation}</p><button className="text-button" onClick={() => { const source = courses.find(c => c.questions.some(q => q.id === current.id)); if (source) { update(s => ({ ...s, selectedDay: source.day, lessonPositions: { ...s.lessonPositions, [source.id]: source.sections.findIndex(section => section.id === current.sectionId) } })); navigate('lessons') } }}><BookOpen size={16} />関連する講義をよむ<ArrowRight size={15} /></button></div>}
    <div className="quiz-actions"><span className="small muted">{answer ? '回答・解説は保存されます' : isChoice ? '選択肢を1つ選んでください' : '数字だけを入力してください'}</span>{answer ? <button className="button primary" onClick={() => { update(s => advanceQuiz(s)); window.scrollTo({ top: 0, behavior: 'instant' }) }}>{draft.index === draft.questionIds.length - 1 ? '結果を見る' : '次の問題へ'}<ArrowRight size={17} /></button> : <button className="button primary" disabled={!canAnswer} onClick={() => update(s => checkAnswer(s, current))}>回答を確定する<Check size={17} /></button>}</div></section>
  })() : last ? <section className="panel result-panel"><div className="result-emblem"><Trophy size={36} strokeWidth={1.6} /></div><p className="eyebrow">SESSION COMPLETE</p><h2>{accuracy(last.answers) >= 80 ? 'よくできました！' : '着実に、身についています。'}</h2><p className="muted">{last.mode === 'review' ? '復習' : `Day ${last.day} 確認テスト`} おつかれさまでした。</p><div className="result-score"><strong>{accuracy(last.answers)}</strong><span>%</span></div><p>{last.answers.filter(a => a.correct).length} / {last.answers.length}問正解</p><p className="small muted">{last.mode === 'test' ? '80%以上の正答と講義の全章読了で、その日の学習達成です。' : '正解した問題は復習待ちから外れました。'}</p><div className="result-breakdown">{last.answers.map((a, i) => <details key={a.questionId}><summary><span className={a.correct ? 'text-success' : 'text-error'}>{a.correct ? <CheckCircle2 size={18} /> : <X size={18} />}</span><span>問{i + 1}　{questionMap.get(a.questionId)?.prompt ?? '教材更新前の問題'}</span></summary><p>{questionMap.get(a.questionId)?.explanation ?? 'この問題の教材は現在収録されていません。'}</p></details>)}</div><div className="result-buttons">{nextCourse && <button className="button primary" onClick={() => { update(s => ({ ...s, selectedDay: nextCourse.day, lastStudy: 'lessons', lastAttemptId: null })); navigate('lessons') }}>Day {nextCourse.day}へ進む<ArrowRight size={17} /></button>}<button className={`button ${nextCourse ? 'secondary' : 'primary'}`} onClick={() => navigate('review')}><RotateCcw size={17} />間違えた問題を復習</button><button className="button secondary" onClick={() => start('test', course.day)}>もう一度テストする</button></div><button className="text-button centered" onClick={() => navigate('stats')}>成績を見る<ArrowRight size={16} /></button></section> : <section className="panel quiz-lobby"><div className="empty-icon"><Target size={28} /></div><p className="eyebrow">DAY {String(course.day).padStart(2, '0')}</p><h2>{course.title}</h2><p className="muted">全{course.questions.length}問。{course.cases?.length ? '資料を読む実技問題を含みます。' : grade === '3' ? '○×・3択で理解を確かめます。' : grade === '2' ? '4択で理解を確かめます。' : '4択と数値入力で理解を確かめます。'}<br />途中で閉じても、続きから再開できます。</p><div className="lobby-tags"><span className="tag">時間制限なし</span><span className="tag">解説つき</span><span className="tag">目標正答率80%</span></div><button className="button primary" onClick={() => start('test', course.day)}>テストをはじめる<ArrowRight size={18} /></button><button className="text-button centered" onClick={() => navigate('lessons')}><BookOpen size={17} />先に講義をよむ</button></section>}
  {confirmation}</>
}

export function Review({ navigate }: { navigate: (p: Page) => void }) {
  const { state } = useStudy()
  const { start, confirmation } = useStartQuiz(navigate)
  const { allQuestions } = useCatalog()
  const wrong = wrongQuestions(state, allQuestions)
  const hasAnswers = Object.keys(state.latestAnswers).length > 0
  return <><div className="page-intro"><div><p className="eyebrow">MAKE IT STICK</p><h1>振り返りが、自信になる。</h1><p className="muted">間違えた問題だけを、もう一度。</p></div><span className="tag lavender-tag">復習待ち {wrong.length}問</span></div>{wrong.length ? <><section className="panel review-banner"><span className="stat-icon lavender"><RotateCcw size={25} /></span><div><h2>{wrong.length}問を復習しましょう</h2><p className="muted small">正解した問題は復習待ちから外れます。何度でも挑戦できます。</p></div><button className="button primary" onClick={() => start('review', state.selectedDay)}>復習をはじめる<ArrowRight size={17} /></button></section><section className="panel review-list"><h2>復習する問題</h2>{wrong.map(q => <div key={q.id}><span className="tag">{q.category}</span><h3>{q.prompt}</h3><p className="small muted">前回の回答：{answerLabel(q, state.latestAnswers[q.id].selected)}</p></div>)}</section></> : <section className="panel"><Empty title={hasAnswers ? '復習待ちはありません' : '復習は、ここから。'} action={<button className="button primary" onClick={() => navigate('quiz')}>確認テストへ<ArrowRight size={17} /></button>}>{hasAnswers ? 'すべての復習待ちの問題に正解しました。確認テストで理解を深めましょう。' : 'テストで間違えた問題が、ここに集まります。まずは確認テストに挑戦しましょう。'}</Empty></section>}{state.draft && <button className="button secondary resume-review" onClick={() => navigate('quiz')}>途中の{state.draft.mode === 'review' ? '復習' : 'テスト'}を再開<ArrowRight size={16} /></button>}{confirmation}</>
}
