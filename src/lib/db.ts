import { openDB, type DBSchema } from 'idb'
import { initialState, type StudyState } from './study'

interface StudyDB extends DBSchema { state: { key: string; value: StudyState } }
const connect = () => openDB<StudyDB>('fp-study-14', 1, { upgrade(db) { db.createObjectStore('state') } })
export async function loadState(): Promise<StudyState> {
  const db = await connect()
  try {
    const state = await db.get('state', 'current')
    if (!state) return structuredClone(initialState)
    if (state.version !== 1) throw new Error('この保存データは新しいバージョンのアプリで開いてください。')
    return { ...structuredClone(initialState), ...state }
  } finally { db.close() }
}
export async function saveState(state: StudyState) {
  const db = await connect()
  try { await db.put('state', state, 'current') } finally { db.close() }
}
