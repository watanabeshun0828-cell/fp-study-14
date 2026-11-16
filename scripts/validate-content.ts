import { readdir, readFile } from 'node:fs/promises'
import { parseCourses } from '../src/lib/content.ts'

const dir = new URL('../src/data/', import.meta.url)
const files = (await readdir(dir)).filter(f => /^day.*\.json$/.test(f))
const modules = Object.fromEntries(await Promise.all(files.map(async f => [f, JSON.parse(await readFile(new URL(f, dir), 'utf8'))])))
const courses = parseCourses(modules)
const plan: { day: number; title: string }[] = JSON.parse(await readFile(new URL('curriculum.json', dir), 'utf8'))
if (courses.length !== 14 || plan.length !== 14 || courses.some((course, index) => course.day !== index + 1 || course.day !== plan[index].day || course.title !== plan[index].title)) {
  throw new Error('Day 1〜14の教材と学習プランをすべて登録し、Day番号とタイトルを一致させてください')
}
console.log(`教材検証 OK: ${courses.length}日分 / ${courses.reduce((n, c) => n + c.sections.length, 0)}章 / ${courses.reduce((n, c) => n + c.questions.length, 0)}問`)
