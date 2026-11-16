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
  it('既存の3級と新しい級を分離し、切り替え直後でも最後の保存を読み込む', async () => {
    const change = (selectedDay: number) => ({ ...initialState, selectedDay })
    await saveState(change(12))
    const first = saveState(change(2), '2')
    const second = saveState(change(4), '2')
    const third = saveState(change(6), '1')
    expect((await loadState('2')).selectedDay).toBe(4)
    expect((await loadState('1')).selectedDay).toBe(6)
    expect((await loadState()).selectedDay).toBe(12)
    await Promise.all([first, second, third])
    await Promise.all([saveState(initialState), saveState(initialState, '2'), saveState(initialState, '1')])
  })
})
