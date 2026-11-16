import { readdir, readFile } from 'node:fs/promises'
import { parseCourses } from '../src/lib/content.ts'
import { grades, gradeLabel } from '../src/lib/grade.ts'

const dir = new URL('../src/data/', import.meta.url)
const originalPlan: { day: number; title: string }[] = JSON.parse(await readFile(new URL('curriculum.json', dir), 'utf8'))
for (const grade of grades) {
  const folder = grade === '3' ? dir : new URL(`grade${grade}/`, dir)
  const files = (await readdir(folder)).filter(file => /^day\d{2}\.json$/.test(file))
  const modules = Object.fromEntries(await Promise.all(files.map(async file => [file, JSON.parse(await readFile(new URL(file, folder), 'utf8'))])))
  const courses = parseCourses(modules)
  if (!courses.length || courses.some((course, index) => course.day !== index + 1)) {
    throw new Error(`${gradeLabel(grade)}のDay番号を1から順番に登録してください`)
  }
  if (grade === '3' && (courses.length !== originalPlan.length ||
    courses.some((course, index) => course.day !== originalPlan[index].day || course.title !== originalPlan[index].title))) {
    throw new Error('FP3級の教材と学習プランの日付・タイトルを一致させてください')
  }
  const chapters = courses.flatMap(course => course.sections)
  const questions = courses.flatMap(course => course.questions)
  console.log(`${gradeLabel(grade)}の教材検証 OK: ${courses.length}日分 / ${chapters.length}章 / ${questions.length}問`)
}
