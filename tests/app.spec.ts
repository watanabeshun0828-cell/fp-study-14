import { expect, test, type Page } from '@playwright/test'
import day1 from '../src/data/day01.json' with { type: 'json' }
import day14 from '../src/data/day14.json' with { type: 'json' }

const menu = (page: Page, name: string) => page.getByRole('navigation', { name: 'モバイルメニュー' }).getByRole('link', { name, exact: true })
const submit = async (page: Page, index: number) => {
  await page.getByRole('radio').nth(index).check()
  await page.getByRole('button', { name: '回答を確定する' }).click()
}

test('iPhone幅：全14日を選べ、Day 1を終えて復習とDay 2に進める', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByText('FP3級の学科6分野と実技を、14日で。')).toBeVisible()
  await expect(page.locator('.day-grid button:enabled')).toHaveCount(14)
  await page.getByRole('button', { name: '今日の学習をはじめる' }).click()
  for (let i = 1; i < day1.sections.length; i++) await page.getByRole('button', { name: '読了して次の章へ' }).click()
  await page.getByRole('button', { name: '読了してテストへ' }).click()
  await page.getByRole('button', { name: 'テストをはじめる' }).click()
  for (const [index, q] of day1.questions.entries()) {
    await expect(page.getByRole('radio')).toHaveCount(q.choices.length)
    await submit(page, index === 0 ? 0 : q.correctIndex)
    if (index === 1) {
      await expect(page.getByText('この端末に保存済み')).toBeVisible()
      await page.reload()
      await expect(page.getByText('正解です！')).toBeVisible()
    }
    await page.getByRole('button', { name: index === day1.questions.length - 1 ? '結果を見る' : '次の問題へ' }).click()
  }
  await expect(page.locator('.result-score')).toHaveText('83%')
  await expect(page.getByRole('button', { name: 'Day 2へ進む' })).toBeVisible()
  await page.getByRole('button', { name: '間違えた問題を復習' }).click()
  await expect(page.getByRole('heading', { name: '1問を復習しましょう' })).toBeVisible()
  await page.getByRole('button', { name: '復習をはじめる' }).click()
  await submit(page, 1)
  await page.getByRole('button', { name: '結果を見る' }).click()
  await page.getByRole('button', { name: '間違えた問題を復習' }).click()
  await expect(page.getByRole('heading', { name: '復習待ちはありません' })).toBeVisible()
  await menu(page, '成績').click()
  await expect(page.locator('.history-table .history-row')).toHaveCount(3)
  await expect(page.locator('.category-list')).toContainText('ライフプランニングと資金計画')
  await menu(page, 'ホーム').click()
  await expect(page.locator('.hero')).toContainText('今日の学習 · Day 2')
  await page.getByRole('button', { name: '今日の学習をはじめる' }).click()
  await expect(page.getByLabel('学習する日')).toHaveValue('2')
  await menu(page, 'テスト').click()
  await expect(page.getByRole('button', { name: 'テストをはじめる' })).toBeVisible()
})

test('オフラインで実技資料を開き、回答と解説を再読み込み後も復元できる', async ({ page, context }) => {
  await page.goto('./')
  await page.waitForFunction(() => !!navigator.serviceWorker.controller)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText(/オフラインで学習中です/)).toBeVisible()
  await page.getByRole('button', { name: 'Day13 実技演習：3科目の事例', exact: true }).click()
  await expect(page.getByRole('heading', { name: '資産設計提案業務を想定した家計表' })).toBeVisible()
  await menu(page, 'テスト').click()
  await page.getByRole('button', { name: 'テストをはじめる' }).click()
  const sheet = page.getByLabel('実技資料：三宅家の家計表')
  await expect(sheet).toContainText('590万円')
  await expect(sheet).toContainText('日本FP協会・資産設計提案業務を想定')
  await sheet.screenshot({ path: 'test-results/fp-practice.png' })
  await submit(page, 0)
  await expect(page.getByText('正解です！')).toBeVisible()
  await expect(page.getByText('この端末に保存済み')).toBeVisible()
  await page.reload()
  await expect(page.getByText('正解です！')).toBeVisible()
  await expect(sheet).toBeVisible()
})

test('最終日の混合16問を解き切り、100%の結果と分野別成績を確認できる', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Day14 最終チェック：総合16問', exact: true }).click()
  await menu(page, 'テスト').click()
  await page.getByRole('button', { name: 'テストをはじめる' }).click()
  for (const [index, q] of day14.questions.entries()) {
    await expect(page.getByRole('radio')).toHaveCount(q.choices.length)
    if ('caseId' in q) await expect(page.getByLabel('実技資料：山岸家の総合資料')).toBeVisible()
    await submit(page, q.correctIndex)
    await page.getByRole('button', { name: index === day14.questions.length - 1 ? '結果を見る' : '次の問題へ' }).click()
  }
  await expect(page.locator('.result-score')).toHaveText('100%')
  await page.getByRole('button', { name: '成績を見る' }).click()
  await expect(page.locator('.category-list .progress')).toHaveCount(6)
})

test('ダークモードを復元でき、320px・デスクトップでも横にはみ出さない', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.hero')).toContainText('ライフプランと資金計画')
  await page.screenshot({ path: 'test-results/fp-home.png' })
  await page.setViewportSize({ width: 320, height: 720 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: '表示・アプリ設定', exact: true }).click()
  await page.getByRole('button', { name: 'ダーク', exact: true }).click()
  await page.getByRole('button', { name: '閉じる', exact: true }).click()
  await expect(page.getByText('この端末に保存済み')).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.setViewportSize({ width: 1440, height: 1000 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
