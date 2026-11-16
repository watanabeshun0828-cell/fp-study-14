import { describe, expect, it } from 'vitest'
import { loadState, saveState } from './db'
import { initialState, createDraft } from './study'
import raw from '../data/day01.json'
import { courseSchema } from './content'
describe('IndexedDB', () => {
  it('初期状態を返し、章位置・解説表示済み回答・テーマ・履歴を復元する', async () => {
    expect(await loadState()).toEqual(initialState)
    const course = courseSchema.parse(raw)
    const draft = createDraft('test', 1, course.questions); draft.selected = 1
    const state = { ...structuredClone(initialState), theme: 'dark' as const, lessonPositions: { [course.id]: 2 }, readSections: [course.sections[0].id], draft }
    await saveState(state)
    expect(await loadState()).toEqual(state)
    await saveState(initialState)
  })
})
