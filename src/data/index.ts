import { parseCourses } from '../lib/content'
import planned from './curriculum.json'

export const courses = parseCourses(import.meta.glob('./day*.json', { eager: true, import: 'default' }))
export const curriculum = planned.map(item => ({ ...item, course: courses.find(c => c.day === item.day) }))
export const allQuestions = courses.flatMap(c => c.questions)
export const questionMap = new Map(allQuestions.map(q => [q.id, q]))
export const caseMap = new Map(courses.flatMap(course => (course.cases ?? []).map(c => [c.id, c] as const)))
