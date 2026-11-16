import { describe, expect, it } from 'vitest'
import raw from '../data/day01.json'
import { courseSchema } from './content'
import { accuracy, advanceQuiz, checkAnswer, createDraft, groupAccuracy, initialState, isDayComplete, localDate, parseNumericAnswer, streak, wrongQuestions, type StudyState } from './study'

const course = courseSchema.parse(raw)
const q = raw.questions[0]
const fresh = (): StudyState => structuredClone(initialState)
describe('採点と復習', () => {
  it('未選択の回答と、重複した回答の確定を防ぐ', () => {
    const state = { ...fresh(), draft: createDraft('test', 1, [q]) }
    expect(checkAnswer(state, q)).toBe(state)
    state.draft.selected = q.correctIndex
    const checked = checkAnswer(state, q)
    expect(checked.draft?.answers).toHaveLength(1)
    expect(checkAnswer(checked, q)).toBe(checked)
    expect(checked.latestAnswers[q.id].correct).toBe(true)
  })
  it('未確定で次へ進めず、完了履歴は1回だけ追加する', () => {
    const draft = createDraft('test', 1, [q])
    const state = { ...fresh(), draft }
    expect(advanceQuiz(state)).toBe(state)
    draft.selected = q.correctIndex
    const done = advanceQuiz(checkAnswer(state, q))
    expect(done.draft).toBeNull()
    expect(done.attempts).toHaveLength(1)
    expect(accuracy(done.attempts[0].answers)).toBe(100)
    expect(advanceQuiz(done)).toBe(done)
  })
  it('誤答だけを復習に出し、復習で正解すると対象から外す', () => {
    const draft = createDraft('test', 1, [q]); draft.selected = (q.correctIndex + 1) % q.choices.length
    const wrong = checkAnswer({ ...fresh(), draft }, q)
    expect(wrongQuestions(wrong, course.questions).map(x => x.id)).toEqual([q.id])
    const review = createDraft('review', 1, [q]); review.selected = q.correctIndex
    const fixed = checkAnswer({ ...wrong, draft: review }, q)
    expect(wrongQuestions(fixed, course.questions)).toEqual([])
  })
  it('複数問題の遷移時に回答選択を解除する', () => {
    const draft = createDraft('test', 1, course.questions); draft.selected = 0
    const next = advanceQuiz(checkAnswer({ ...fresh(), draft }, q))
    expect(next.draft?.index).toBe(1)
    expect(next.draft?.selected).toBeNull()
    expect(next.draft?.answers).toHaveLength(1)
  })
  it('全章読了と80%以上のテストが両方必要で、復習結果は達成に使わない', () => {
    const answers = raw.questions.map(q => ({ questionId: q.id, selected: q.correctIndex, correct: true, answeredAt: new Date().toISOString(), category: q.category }))
    const attempt = { id: 'a', mode: 'test' as const, day: 1, answers, startedAt: '', completedAt: '' }
    const state = { ...fresh(), attempts: [attempt] }
    expect(isDayComplete(course, state)).toBe(false)
    state.readSections = course.sections.map(s => s.id)
    expect(isDayComplete(course, state)).toBe(true)
    expect(isDayComplete(course, { ...state, attempts: [{ ...attempt, mode: 'review' }] })).toBe(false)
    expect(isDayComplete(course, { ...state, attempts: [{ ...attempt, answers: answers.map(a => ({ ...a, correct: false })) }] })).toBe(false)
  })
  it('数値回答を正規化して採点し、次の問題で入力を取り除く', () => {
    const question = { id: 'numeric', category: '不動産', sectionId: 's1', prompt: '金額', format: 'numeric' as const, solution: -1234.5, unit: '万円', explanation: '解説' }
    const draft = createDraft('test', 1, [question, q])
    draft.input = '12,34'
    const state = { ...fresh(), draft }
    expect(checkAnswer(state, question)).toBe(state)
    draft.input = ' −１，２３４．５ '
    const answered = checkAnswer(state, question)
    expect(answered.latestAnswers[question.id]).toMatchObject({ correct: true, selected: -1234.5 })
    expect(advanceQuiz(answered).draft?.input).toBeUndefined()
    expect(parseNumericAnswer('0')).toBe(0)
    expect(parseNumericAnswer('1e3')).toBeNull()
  })
})
describe('日付と集計', () => {
  it('昨日まで続けていれば連続学習を維持し、途切れたら0日になる', () => {
    const now = new Date(2026, 10, 15, 8)
    expect(streak(['2026-11-13', '2026-11-14'], now)).toBe(2)
    expect(streak(['2026-11-13', '2026-11-14', '2026-11-15'], now)).toBe(3)
    expect(streak(['2026-11-13'], now)).toBe(0)
    expect(localDate(now)).toBe('2026-11-15')
  })
  it('分野単位で延べ回答を集計する', () => {
    const base = { questionId: 'x', selected: 0, answeredAt: '', category: '不動産' }
    expect(groupAccuracy([{ ...base, correct: true }, { ...base, correct: false }], a => a.category)).toEqual([{ label: '不動産', total: 2, correct: 1, rate: 50 }])
    expect(accuracy([])).toBe(0)
  })
})
