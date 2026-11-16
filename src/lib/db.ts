import { openDB, type DBSchema } from 'idb'
import { initialState, type StudyState } from './study'
import type { Grade } from './grade'

interface StudyDB extends DBSchema { state: { key: string; value: StudyState } }
const connect = () => openDB<StudyDB>('fp-study-14', 1, { upgrade(db) { db.createObjectStore('state') } })
const pendingWrites = new Map<Grade, Promise<void>>()
const storageKey = (grade: Grade) => grade === '3' ? 'current' : `grade-${grade}`

export async function loadState(grade: Grade = '3'): Promise<StudyState> {
  await pendingWrites.get(grade)
  const db = await connect()
  try {
    const state = await db.get('state', storageKey(grade))
    if (!state) return structuredClone(initialState)
    if (state.version !== 1) throw new Error('この保存データは新しいバージョンのアプリで開いてください。')
    return { ...structuredClone(initialState), ...state }
  } finally { db.close() }
}
export function saveState(state: StudyState, grade: Grade = '3'): Promise<void> {
  const write = (pendingWrites.get(grade) ?? Promise.resolve()).then(async () => {
    const db = await connect()
    try { await db.put('state', state, storageKey(grade)) } finally { db.close() }
  })
  const settled = write.catch(() => {})
  pendingWrites.set(grade, settled)
  void settled.then(() => { if (pendingWrites.get(grade) === settled) pendingWrites.delete(grade) })
  return write
}
