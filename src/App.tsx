import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { BookOpen, Calculator, Check, ChevronRight, CircleHelp, CheckCircle2, Download, GraduationCap, House, Laptop, Moon, RotateCcw, Settings2, Share, ShieldCheck, Smartphone, Sun, Target, TrendingUp, WifiOff } from 'lucide-react'
import { StudyProvider, useStudy } from './lib/store'
import { useGrade } from './lib/grade-context'
import { gradeLabel, grades } from './lib/grade'
import type { Page } from './lib/study'
import Home from './components/Home'
import Lessons from './components/Lessons'
import Quiz, { Review } from './components/Quiz'
import Stats from './components/Stats'
import { Dialog } from './components/Shared'

const navItems = [
  { id: 'home', label: 'ホーム', icon: House }, { id: 'lessons', label: '講義', icon: BookOpen },
  { id: 'quiz', label: 'テスト', icon: Target }, { id: 'review', label: '復習', icon: RotateCcw }, { id: 'stats', label: '成績', icon: TrendingUp }
] as const
const getPage = (): Page => { const id = window.location.hash.replace('#/', ''); return navItems.some(n => n.id === id) ? id as Page : 'home' }
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export default function App() {
  const { grade } = useGrade()
  const [offlineReady, setOfflineReady] = useState(false)
  const worker = useRegisterSW({
    onOfflineReady: () => setOfflineReady(true),
    onRegisteredSW: (_url, registration) => { if (registration?.active && navigator.serviceWorker.controller) setOfflineReady(true) },
    onRegisterError: () => setOfflineReady(false)
  })
  return <StudyProvider key={grade} grade={grade}><CourseApp offlineReady={offlineReady} worker={worker} /></StudyProvider>
}

function CourseApp({ offlineReady, worker }: { offlineReady: boolean; worker: ReturnType<typeof useRegisterSW> }) {
  const { state, update, saveStatus, retrySave } = useStudy()
  const { grade, selectGrade } = useGrade()
  const [page, setPage] = useState<Page>(getPage)
  const [settings, setSettings] = useState(false)
  const [install, setInstall] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  const [updateError, setUpdateError] = useState(false)
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = worker
  useEffect(() => {
    const change = () => { setPage(getPage()); window.scrollTo({ top: 0, behavior: 'instant' }) }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.theme = state.theme === 'system' ? media.matches ? 'dark' : 'light' : state.theme }
    apply(); media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [state.theme])
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false)
    const beforeInstall = (e: Event) => { e.preventDefault(); setInstallEvent(e as InstallEvent) }
    const installedNow = () => { setInstalled(true); setInstallEvent(null); setInstall(false) }
    window.addEventListener('online', on); window.addEventListener('offline', off)
    window.addEventListener('beforeinstallprompt', beforeInstall); window.addEventListener('appinstalled', installedNow)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.removeEventListener('beforeinstallprompt', beforeInstall); window.removeEventListener('appinstalled', installedNow) }
  }, [])
  const navigate = (p: Page) => { window.location.hash = `/${p}`; setPage(p); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const openLesson = (day: number) => { update(s => ({ ...s, selectedDay: day, lastStudy: 'lessons', lastAttemptId: s.selectedDay === day ? s.lastAttemptId : null })); navigate('lessons') }
  const installApp = async () => { if (installEvent) { await installEvent.prompt(); const choice = await installEvent.userChoice; setInstallEvent(null); if (choice.outcome === 'accepted') setInstall(false) } else setInstall(true) }
  return <div className="app-shell"><a href="#main-content" onClick={e => { e.preventDefault(); document.getElementById("main-content")?.focus() }} className="skip-link">本文へ移動</a><aside className="sidebar"><a className="brand" href="#/home" aria-label="FP STUDY 14 ホーム"><span className="brand-mark"><Calculator size={25} strokeWidth={1.8} /></span><span><strong>FP STUDY<span className="brand-14">14</span></strong><span className="brand-subtitle">{gradeLabel(grade)}</span></span></a><div className="nav-caption">LEARNING SPACE</div><nav className="desktop-nav" aria-label="メインメニュー">{navItems.map(({ id, label, icon: Icon }) => <a href={`#/${id}`} key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined}><Icon size={20} strokeWidth={1.8} /><span>{label}</span>{page === id && <span className="active-dot" />}</a>)}</nav><div className="sidebar-bottom"><div className="sidebar-promise"><span className="promise-icon"><GraduationCap size={23} /></span><p>未来の自分に、<br />今日の20分を。</p><span>ONE STEP EVERY DAY.</span></div><button className="sidebar-setting" onClick={() => setSettings(true)}><Settings2 size={18} />表示・アプリ設定<ChevronRight size={15} /></button><span className="sidebar-version">FP STUDY 14 <span>Ver. 1.1</span></span></div></aside>
  <div className="workspace"><header className="topbar"><div className="desktop-breadcrumb">マイ学習ノート<ChevronRight size={13} /><strong>{navItems.find(n => n.id === page)?.label}</strong></div><a className="mobile-brand" href="#/home"><span className="brand-mark"><Calculator size={21} /></span><strong>FP STUDY <span>14</span></strong></a><div className="topbar-actions"><span className={`connection-status ${!online ? 'offline' : ''}`}>{!online ? <WifiOff size={15} /> : offlineReady ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}<span>{!online ? 'オフライン' : offlineReady ? 'オフライン利用OK' : 'この端末に学習を保存'}</span></span><button className="icon-button theme-toggle" onClick={() => update(s => ({ ...s, theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' }))} aria-label="ライト・ダークモードを切り替え">{state.theme === 'dark' || (state.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? <Sun size={20} /> : <Moon size={19} />}</button><button className="icon-button mobile-settings" onClick={() => setSettings(true)} aria-label="表示・アプリ設定"><Settings2 size={20} /></button></div></header>
  <main id="main-content" className="main-content" tabIndex={-1}><div className="course-switch" role="group" aria-label="学習する級">
    {grades.map(item => <button key={item} type="button" aria-pressed={item === grade} disabled={saveStatus !== 'saved' && item !== grade} onClick={() => selectGrade(item)}>{gradeLabel(item)}</button>)}
  </div>{saveStatus === 'error' && <div className="notice error-notice" role="alert">学習データを保存できませんでした。ストレージ容量やブラウザ設定を確認してください。<button onClick={retrySave}>保存を再試行</button></div>}{!online && <div className="notice" role="status"><WifiOff size={17} />オフラインで学習中です。学習記録はこの端末に保存されます。</div>}
  {page === 'home' ? <Home navigate={navigate} openLesson={openLesson} /> : page === 'lessons' ? <Lessons navigate={navigate} /> : page === 'quiz' ? <Quiz navigate={navigate} /> : page === 'review' ? <Review navigate={navigate} /> : <Stats />}
  <footer className="page-footer"><span>毎日の学びを、あなたの力に。</span><span className="save-state" role="status">{saveStatus === 'saved' ? <Check size={13} /> : null}{saveStatus === 'saved' ? 'この端末に保存済み' : saveStatus === 'saving' ? '保存中…' : '保存を確認してください'}</span></footer></main></div>
  <nav className="bottom-nav" aria-label="モバイルメニュー">{navItems.map(({ id, label, icon: Icon }) => <a key={id} href={`#/${id}`} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined}><Icon size={21} strokeWidth={page === id ? 2.3 : 1.7} /><span>{label}</span></a>)}</nav>
  {needRefresh && <div className="update-toast" role="status"><p>新しい教材・アプリを利用できます。{updateError && '更新できませんでした。接続を確認してください。'}</p><button disabled={saveStatus !== 'saved'} onClick={() => updateServiceWorker(true).catch(() => setUpdateError(true))}>保存して更新</button><button aria-label="更新をあとにする" onClick={() => setNeedRefresh(false)}>あとで</button></div>}
  {settings && <Dialog title="表示・アプリ設定" close={() => setSettings(false)}><p className="setting-title">カラーテーマ</p><div className="theme-options">{([{ value: 'light', label: 'ライト', icon: Sun }, { value: 'dark', label: 'ダーク', icon: Moon }, { value: 'system', label: '端末に合わせる', icon: Laptop }] as const).map(({ value, label, icon: Icon }) => <button key={value} className={state.theme === value ? 'selected' : ''} onClick={() => update(s => ({ ...s, theme: value }))} aria-pressed={state.theme === value}><Icon size={21} />{label}</button>)}</div><div className="settings-divider" /><div className="settings-info"><Smartphone size={22} /><div><strong>ホーム画面から、すぐ学習。</strong><p>インストールすれば、アプリのように使えます。</p></div></div><button className="button primary wide" disabled={installed} onClick={() => { setSettings(false); void installApp() }}><Download size={17} />{installed ? 'インストール済み' : 'インストール方法を見る'}</button><div className="storage-info"><ShieldCheck size={18} /><p>学習履歴はこの端末のIndexedDBに保存されます。ブラウザデータの削除や端末変更で引き継がれません。プライベートブラウズでは保存が制限される場合があります。</p></div><p className="small muted">FP STUDY 14 · Ver. 1.1<br />FP3級・FP2級・FP1級の非公式学習教材</p></Dialog>}
  {install && <Dialog title="ホーム画面に追加" close={() => setInstall(false)}><div className="install-visual"><Smartphone size={40} /><BookOpen size={27} /></div><p>iPhoneではSafariでこのアプリを開き、以下の手順で追加します。</p><ol className="install-steps"><li><span className="step-circle">1</span><span><Share size={17} />共有メニューを開く</span></li><li><span className="step-circle">2</span><span>「ホーム画面に追加」を選ぶ</span></li><li><span className="step-circle">3</span><span>「追加」をタップ</span></li></ol><p className="small muted">他のブラウザでは、メニューから「アプリをインストール」などを選びます。</p><div className="storage-info"><CircleHelp size={19} /><p>最初はオンラインで開き、「オフライン利用OK」の表示を確認してください。収録済みの講義と問題をオフラインで使えます。</p></div></Dialog>}
  </div>
}
