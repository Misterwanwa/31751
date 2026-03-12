'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { WindowManagerProvider, useWindowManager } from '@/components/window/WindowManager'
import WindowFrame from '@/components/window/WindowFrame'
import DesktopIcon from '@/components/desktop/DesktopIcon'
import Taskbar from '@/components/desktop/Taskbar'
import BootScreen from '@/components/boot/BootScreen'
import LoginScreen from '@/components/boot/LoginScreen'

// Lern-Apps (React Flow → kein SSR)
const PaintApp = dynamic(() => import('@/components/apps/paint/PaintApp'), { ssr: false })
const ERDApp = dynamic(() => import('@/components/apps/erd/ERDApp'), { ssr: false })
const BPMNApp = dynamic(() => import('@/components/apps/bpmn/BPMNApp'), { ssr: false })
const MetaMatrixApp = dynamic(() => import('@/components/apps/metamatrix/MetaMatrixApp'), { ssr: false })
const QuizApp = dynamic(() => import('@/components/apps/quiz/QuizApp'), { ssr: false })
const SQLApp = dynamic(() => import('@/components/apps/sql/SQLApp'), { ssr: false })

// Dekorative Apps
const XPTourApp = dynamic(() => import('@/components/apps/xptour/XPTourApp'), { ssr: false })
const WordApp = dynamic(() => import('@/components/apps/word/WordApp'), { ssr: false })
const MessengerApp = dynamic(() => import('@/components/apps/messenger/MessengerApp'), { ssr: false })
const OutlookApp = dynamic(() => import('@/components/apps/outlook/OutlookApp'), { ssr: false })
const MovieMakerApp = dynamic(() => import('@/components/apps/moviemaker/MovieMakerApp'), { ssr: false })
const SpaceCadetApp = dynamic(() => import('@/components/apps/spacecadet/SpaceCadetApp'), { ssr: false })

const APPS = [
  // ── Lern-Programme ──────────────────────────────────────────
  {
    id: 'paint', icon: '🎨', label: 'Paint',
    title: 'Untitled - Paint',
    width: 900, height: 700, component: 'paint', group: 'study',
  },
  {
    id: 'erd', icon: '🗄️', label: 'ERD Database Designer',
    title: 'ERD Database Designer – Konzeptuelle Datenmodellierung',
    width: 1100, height: 680, component: 'erd', group: 'study',
  },
  {
    id: 'bpmn', icon: '🔄', label: 'Process Flow Modeler',
    title: 'Process Flow Modeler – Geschäftsprozessmodellierung',
    width: 1100, height: 680, component: 'bpmn', group: 'study',
  },
  {
    id: 'meta', icon: '🧩', label: 'OMG Meta-Matrix',
    title: 'OMG Meta-Matrix Simulator – Sprachebenen & Abstraktion',
    width: 1000, height: 620, component: 'metamatrix', group: 'study',
  },
  {
    id: 'quiz', icon: '📜', label: 'Zertifikatsprüfung',
    title: 'Multiple-Choice Zertifikatsprüfung – Theorie & Grundbegriffe',
    width: 800, height: 640, component: 'quiz', group: 'study',
  },
  {
    id: 'sql', icon: '💻', label: 'MS-DOS SQL Terminal',
    title: 'MS-DOS – SQL & Relationenalgebra',
    width: 860, height: 600, component: 'sql', group: 'study',
  },
  // ── System-Programme ─────────────────────────────────────────
  {
    id: 'xptour', icon: '🪟', label: 'Windows XP Tour',
    title: 'Windows XP Tour',
    width: 640, height: 480, component: 'xptour', group: 'system',
  },
  {
    id: 'word', icon: '📝', label: 'Microsoft Word',
    title: 'Dokument1 – Microsoft Word',
    width: 900, height: 660, component: 'word', group: 'system',
  },
  {
    id: 'messenger', icon: '🦋', label: 'Windows Messenger',
    title: 'Windows Messenger',
    width: 280, height: 500, component: 'messenger', group: 'system',
  },
  {
    id: 'outlook', icon: '📧', label: 'Outlook Express',
    title: 'Outlook Express',
    width: 860, height: 580, component: 'outlook', group: 'system',
  },
  {
    id: 'moviemaker', icon: '🎬', label: 'Windows Movie Maker',
    title: 'Windows Movie Maker',
    width: 960, height: 640, component: 'moviemaker', group: 'system',
  },
  {
    id: 'spacecadet', icon: '🚀', label: '3D Pinball Space Cadet',
    title: '3D Pinball for Windows – Space Cadet',
    width: 760, height: 760, component: 'spacecadet', group: 'system',
  },
]

const STUDY_APPS = APPS.filter(a => a.group === 'study')
const SYSTEM_APPS = APPS.filter(a => a.group === 'system')

function AppContent({ component }: { component: string }) {
  switch (component) {
    case 'paint':      return <PaintApp />
    case 'erd':        return <ERDApp />
    case 'bpmn':       return <BPMNApp />
    case 'metamatrix': return <MetaMatrixApp />
    case 'quiz':       return <QuizApp />
    case 'sql':        return <SQLApp />
    case 'xptour':     return <XPTourApp />
    case 'word':       return <WordApp />
    case 'messenger':  return <MessengerApp />
    case 'outlook':    return <OutlookApp />
    case 'moviemaker': return <MovieMakerApp />
    case 'spacecadet': return <SpaceCadetApp />
    default:           return null
  }
}

function Desktop() {
  const { windows, openWindow } = useWindowManager()

  function openApp(app: typeof APPS[0]) {
    openWindow({
      id: app.id,
      title: app.title,
      icon: app.icon,
      component: app.component,
      x: Math.max(20, Math.floor(Math.random() * 160) + 20),
      y: Math.max(20, Math.floor(Math.random() * 80) + 10),
      width: Math.min(app.width, typeof window !== 'undefined' ? window.innerWidth - 40 : app.width),
      height: Math.min(app.height, typeof window !== 'undefined' ? window.innerHeight - 80 : app.height),
    })
  }

  const taskbarApps = APPS.map(app => ({
    id: app.id, icon: app.icon, label: app.label, onOpen: () => openApp(app),
  }))

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
      backgroundImage: 'url(/bliss.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Desktop icons – left column: Lern-Apps */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STUDY_APPS.map(app => (
          <DesktopIcon key={app.id} icon={app.icon} label={app.label} onOpen={() => openApp(app)} />
        ))}
      </div>

      {/* Desktop icons – right column: System-Apps */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {SYSTEM_APPS.map(app => (
          <DesktopIcon key={app.id} icon={app.icon} label={app.label} onOpen={() => openApp(app)} />
        ))}
      </div>

      {/* Open windows */}
      {windows.map(win => (
        <WindowFrame key={win.id} win={win}>
          <AppContent component={win.component} />
        </WindowFrame>
      ))}

      {/* Taskbar */}
      <Taskbar apps={taskbarApps} />
    </div>
  )
}

type Stage = 'boot' | 'login' | 'desktop'

export default function Home() {
  const [stage, setStage] = useState<Stage>('boot')

  if (stage === 'boot') {
    return <BootScreen onDone={() => setStage('login')} />
  }
  if (stage === 'login') {
    return <LoginScreen onLogin={() => setStage('desktop')} />
  }
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  )
}
