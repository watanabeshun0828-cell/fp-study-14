import { parseCourses, type Course } from '../lib/content'
import type { Grade } from '../lib/grade'
import { useGrade } from '../lib/grade-context'
import planned from './curriculum.json'

function createCatalog(modules: Record<string, unknown>, plan?: typeof planned) {
  const courses = parseCourses(modules)
  const curriculum: { day: number; title: string; group: string; course?: Course }[] = plan
    ? plan.map(item => ({ ...item, course: courses.find(c => c.day === item.day) }))
    : courses.map(course => ({ day: course.day, title: course.title, group: course.group ?? course.questions[0].category, course }))
  const allQuestions = courses.flatMap(course => course.questions)
  const questionMap = new Map(allQuestions.map(question => [question.id, question]))
  const caseMap = new Map(courses.flatMap(course => (course.cases ?? []).map(c => [c.id, c] as const)))
  return { courses, curriculum, allQuestions, questionMap, caseMap }
}

const catalogs: Record<Grade, ReturnType<typeof createCatalog>> = {
  '3': createCatalog(import.meta.glob('./day*.json', { eager: true, import: 'default' }), planned),
  '2': createCatalog(import.meta.glob('./grade2/day*.json', { eager: true, import: 'default' })),
  '1': createCatalog(import.meta.glob('./grade1/day*.json', { eager: true, import: 'default' }))
}

export const useCatalog = () => catalogs[useGrade().grade]
