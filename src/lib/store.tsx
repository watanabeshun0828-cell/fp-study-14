import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { loadState, saveState } from './db'
import { initialState, type StudyState } from './study'

type Update = (fn: (state: StudyState) => StudyState) => void
const Context = createContext<{ state: StudyState; update: Update; saveStatus: 'saved' | 'saving' | 'error'; retrySave: () => void } | null>(null)
export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(initialState)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const queue = useRef(Promise.resolve())
  const current = useRef(state)
  const serial = useRef(0)
  const hydrate = () => { setLoadError(false); loadState().then(s => { current.current = s; setState(s); setLoaded(true) }).catch(() => setLoadError(true)) }
  useEffect(hydrate, [])
  const persist = (next: StudyState) => {
    const sequence = ++serial.current
    setSaveStatus('saving')
    queue.current = queue.current.catch(() => {}).then(() => saveState(next)).then(() => { if (sequence === serial.current) setSaveStatus('saved') }).catch(() => { if (sequence === serial.current) setSaveStatus('error') })
  }
  const update: Update = fn => {
    const next = fn(current.current)
    if (next === current.current) return
    current.current = next
    setState(next)
    persist(next)
  }
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (saveStatus !== 'saved') { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saveStatus])
  if (loadError) return <main className="loading"><h1>学習データを開けませんでした</h1><p>ブラウザのストレージ設定を確認してください。保存データの上書きは行っていません。</p><button className="button primary" onClick={hydrate}>もう一度読み込む</button></main>
  if (!loaded) return <main className="loading"><span className="loading-mark">AI</span><p>学習ノートを開いています…</p></main>
  return <Context.Provider value={{ state, update, saveStatus, retrySave: () => persist(current.current) }}>{children}</Context.Provider>
}
export function useStudy() { const ctx = useContext(Context); if (!ctx) throw new Error('StudyProvider is required'); return ctx }
