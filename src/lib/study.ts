import type { Course, Question } from './content'

export type Page = 'home' | 'lessons' | 'quiz' | 'review' | 'stats'
export type Theme = 'system' | 'light' | 'dark'
export interface Answer { questionId: string; selected: number; correct: boolean; answeredAt: string; category: string }
export interface QuizDraft { id: string; mode: 'test' | 'review'; day: number; questionIds: string[]; index: number; selected: number | null; answers: Answer[]; startedAt: string }
export interface Attempt { id: string; mode: 'test' | 'review'; day: number; answers: Answer[]; startedAt: string; completedAt: string }
export interface StudyState {
  version: 1; theme: Theme; selectedDay: number;
  lessonPositions: Record<string, number>; readSections: string[];
  latestAnswers: Record<string, Answer>; attempts: Attempt[];
  draft: QuizDraft | null; lastAttemptId: string | null;
  activityDates: string[]; lastStudy: 'lessons' | 'quiz' | null;
}
export const initialState: StudyState = { version: 1, theme: 'system', selectedDay: 1, lessonPositions: {}, readSections: [], latestAnswers: {}, attempts: [], draft: null, lastAttemptId: null, activityDates: [], lastStudy: null }
export const localDate = (date: Date | string = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function addActivity(state: StudyState, now = new Date().toISOString()): string[] {
  return [...new Set([...state.activityDates, localDate(now)])].sort()
}
export function accuracy(answers: Answer[]): number {
  return answers.length ? Math.round(answers.filter(a => a.correct).length / answers.length * 100) : 0
}
export function isDayComplete(course: Course, state: StudyState) {
  return course.sections.every(s => state.readSections.includes(s.id)) && state.attempts.some(a => a.mode === 'test' && a.day === course.day && course.questions.every(q => a.answers.some(answer => answer.questionId === q.id)) && accuracy(a.answers) >= 80)
}
export function wrongQuestions(state: StudyState, questions: Question[]) {
  return questions.filter(q => state.latestAnswers[q.id]?.correct === false)
}
export function streak(dates: string[], now = new Date()): number {
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  if (!dates.includes(localDate(cursor))) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (dates.includes(localDate(cursor))) { count++; cursor.setDate(cursor.getDate() - 1) }
  return count
}
export function createDraft(mode: QuizDraft['mode'], day: number, questions: Question[]): QuizDraft {
  return { id: crypto.randomUUID(), mode, day, questionIds: questions.map(q => q.id), index: 0, selected: null, answers: [], startedAt: new Date().toISOString() }
}
export function checkAnswer(state: StudyState, question: Question, now = new Date().toISOString()): StudyState {
  const draft = state.draft
  if (!draft || draft.selected === null || !Number.isInteger(draft.selected) || draft.selected < 0 || draft.selected >= question.choices.length || draft.questionIds[draft.index] !== question.id || draft.answers.some(a => a.questionId === question.id)) return state
  const answer: Answer = { questionId: question.id, selected: draft.selected, correct: draft.selected === question.correctIndex, answeredAt: now, category: question.category }
  return { ...state, draft: { ...draft, answers: [...draft.answers, answer] }, latestAnswers: { ...state.latestAnswers, [question.id]: answer }, activityDates: addActivity(state, now), lastStudy: 'quiz' }
}
export function advanceQuiz(state: StudyState, now = new Date().toISOString()): StudyState {
  const draft = state.draft
  if (!draft || !draft.answers.some(a => a.questionId === draft.questionIds[draft.index])) return state
  if (draft.index < draft.questionIds.length - 1) return { ...state, draft: { ...draft, index: draft.index + 1, selected: null } }
  const attempt: Attempt = { id: draft.id, mode: draft.mode, day: draft.day, answers: draft.answers, startedAt: draft.startedAt, completedAt: now }
  return { ...state, draft: null, attempts: state.attempts.some(a => a.id === attempt.id) ? state.attempts : [...state.attempts, attempt], lastAttemptId: attempt.id, activityDates: addActivity(state, now) }
}
export function groupAccuracy(answers: Answer[], key: (a: Answer) => string) {
  const groups = new Map<string, Answer[]>()
  answers.forEach(a => { const k = key(a); groups.set(k, [...(groups.get(k) ?? []), a]) })
  return [...groups].map(([label, values]) => ({ label, total: values.length, correct: values.filter(a => a.correct).length, rate: accuracy(values) }))
}
