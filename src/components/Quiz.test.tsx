import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import Quiz from './Quiz'
import { StudyProvider } from '../lib/store'
import { initialState } from '../lib/study'
import { saveState } from '../lib/db'

beforeEach(async () => { await saveState(structuredClone(initialState)) })
it('○×の採点と解説を再マウント後も復元し、次の三択問題へ進める', async () => {
  const user = userEvent.setup()
  const first = render(<StudyProvider><Quiz navigate={vi.fn()} /></StudyProvider>)
  await user.click(await screen.findByRole('button', { name: /テストをはじめる/ }))
  const check = screen.getByRole('button', { name: /回答を確定する/ })
  expect(check).toBeDisabled()
  expect(screen.getAllByRole('radio')).toHaveLength(2)
  await user.click(screen.getByRole('radio', { name: /誤り/ }))
  await user.click(check)
  expect(screen.getByText('正解です！')).toBeInTheDocument()
  expect(screen.getByText(/税理士等の独占業務/)).toBeInTheDocument()
  await waitFor(async () => { const { loadState } = await import('../lib/db'); expect((await loadState()).draft?.answers).toHaveLength(1) })
  first.unmount()
  render(<StudyProvider><Quiz navigate={vi.fn()} /></StudyProvider>)
  expect(await screen.findByText('正解です！')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /次の問題へ/ }))
  expect(screen.getByText(/FP相談の最初の段階/)).toBeInTheDocument()
  expect(screen.getAllByRole('radio')).toHaveLength(3)
  expect(screen.getByRole('button', { name: /回答を確定する/ })).toBeDisabled()
})
