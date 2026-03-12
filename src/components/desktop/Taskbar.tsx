'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useWindowManager, WindowDef } from '../window/WindowManager'
import StartMenu from './StartMenu'

interface AppEntry { id: string; icon: string; label: string; onOpen: () => void }
interface Props { apps: AppEntry[] }

export default function Taskbar({ apps }: Props) {
  const { windows, restoreWindow, focusWindow, minimizeWindow } = useWindowManager()
  const [showStart, setShowStart] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  function handleTaskbarBtn(win: WindowDef) {
    if (win.minimized) restoreWindow(win.id)
    else focusWindow(win.id)
  }

  return (
    <>
      {showStart && <StartMenu apps={apps} onClose={() => setShowStart(false)} />}

      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 30,
        background: 'linear-gradient(to bottom, rgb(31,47,134), rgb(25,65,165))',
        display: 'flex',
        alignItems: 'center',
        zIndex: 997,
        flexDirection: 'row',
      }}>
        {/* Start button */}
        <button
          id="start-menu-btn"
          onClick={() => setShowStart(s => !s)}
          style={{
            width: 100,
            height: '100%',
            backgroundImage: 'url(/images/xp/start_btn_normal.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            filter: showStart ? 'brightness(0.85)' : undefined,
          }}
          aria-label="Start"
        />

        {/* Open windows / program tray */}
        <div style={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden', padding: '0 4px', height: '100%', alignItems: 'center' }}>
          {windows.map(win => {
            const isActive = !win.minimized
            return (
              <button
                key={win.id}
                onClick={() => handleTaskbarBtn(win)}
                title={win.title}
                style={{
                  background: isActive ? 'rgb(30,82,183)' : 'rgb(60,129,243)',
                  boxShadow: isActive
                    ? 'inset 1px 1px 3px rgba(0,0,0,0.7)'
                    : 'inset 1px 1px 2px rgba(0,0,0,0.2)',
                  border: 'none',
                  borderRadius: 2,
                  color: '#f8faff',
                  fontSize: 11,
                  fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
                  padding: '0 6px',
                  height: '85%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  width: 150,
                  minWidth: 70,
                  maxWidth: 200,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <span style={{ flexShrink: 0, fontSize: 12 }}>{win.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1 }}>
                  {win.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* System tray */}
        <div
          className="system-tray"
          style={{
            flexShrink: 0,
            maxWidth: 200,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 6px',
            gap: 4,
          }}
        >
          <Image src="/images/xp/icons/Volume.png" alt="Volume" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
          <Image src="/images/xp/icons/SecurityError.png" alt="Security" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
          <Image src="/images/xp/icons/TourXP.png" alt="Tour XP" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
          <span style={{
            color: '#f8faff',
            fontSize: 11,
            fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
            paddingLeft: 4,
            whiteSpace: 'nowrap',
          }}>
            {time}
          </span>
        </div>
      </div>
    </>
  )
}
