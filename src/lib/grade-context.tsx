import { createContext, useContext, useState, type ReactNode } from 'react'
import { grades, type Grade } from './grade'

const storageKey = 'fp-study-14.active-grade'
const GradeContext = createContext<{ grade: Grade; selectGrade: (grade: Grade) => void }>({
  grade: '3', selectGrade: () => {}
})

function storedGrade(): Grade {
  try {
    const value = localStorage.getItem(storageKey)
    return grades.find(grade => grade === value) ?? '3'
  } catch {
    return '3'
  }
}

export function GradeProvider({ children }: { children: ReactNode }) {
  const [grade, setGrade] = useState(storedGrade)
  const selectGrade = (next: Grade) => {
    if (next === grade) return
    window.history.replaceState(null, '', '#/home')
    window.scrollTo({ top: 0, behavior: 'instant' })
    try { localStorage.setItem(storageKey, next) } catch { /* The current selection is still available in memory. */ }
    setGrade(next)
  }
  return <GradeContext.Provider value={{ grade, selectGrade }}>{children}</GradeContext.Provider>
}

export const useGrade = () => useContext(GradeContext)
