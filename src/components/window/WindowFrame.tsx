'use client'
import { useRef, useEffect, ReactNode } from 'react'
import { useWindowManager, WindowDef } from './WindowManager'

interface Props {
  win: WindowDef
  children: ReactNode
}

export default function WindowFrame({ win, children }: Props) {
  const { closeWindow, focusWindow, minimizeWindow, maximizeWindow, moveWindow } = useWindowManager()
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const frameRef = useRef<HTMLDivElement>(null)

  const taskbarHeight = 40

  const style: React.CSSProperties = win.maximized
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: `calc(100vh - ${taskbarHeight}px)`,
        zIndex: win.zIndex,
        display: win.minimized ? 'none' : 'flex',
      }
    : {
        position: 'fixed',
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        display: win.minimized ? 'none' : 'flex',
      }

  function onTitleMouseDown(e: React.MouseEvent) {
    if (win.maximized) return
    e.preventDefault()
    focusWindow(win.id)
    dragging.current = true
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y }
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const newX = Math.max(0, e.clientX - dragOffset.current.x)
      const newY = Math.max(0, e.clientY - dragOffset.current.y)
      moveWindow(win.id, newX, newY)
    }
    function onMouseUp() { dragging.current = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [win.id, moveWindow])

  return (
    <div
      ref={frameRef}
      className="xp-window"
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div className="xp-window-titlebar" onMouseDown={onTitleMouseDown}>
        <span style={{ fontSize: 14 }}>{win.icon}</span>
        <span className="xp-window-title">{win.title}</span>
        <div className="xp-window-controls">
          <button
            className="xp-ctrl-btn xp-ctrl-minimize"
            title="Minimieren"
            onClick={e => { e.stopPropagation(); minimizeWindow(win.id) }}
          >
            <span style={{ fontFamily: 'sans-serif', fontSize: 10, lineHeight: 1 }}>_</span>
          </button>
          <button
            className="xp-ctrl-btn xp-ctrl-maximize"
            title={win.maximized ? 'Wiederherstellen' : 'Maximieren'}
            onClick={e => { e.stopPropagation(); maximizeWindow(win.id) }}
          >
            <span style={{ fontFamily: 'sans-serif', fontSize: 10, lineHeight: 1 }}>
              {win.maximized ? '❐' : '□'}
            </span>
          </button>
          <button
            className="xp-ctrl-btn xp-ctrl-close"
            title="Schließen"
            onClick={e => { e.stopPropagation(); closeWindow(win.id) }}
          >
            <span style={{ fontFamily: 'sans-serif', fontSize: 11, lineHeight: 1, fontWeight: 'bold' }}>✕</span>
          </button>
        </div>
      </div>
      {/* Body */}
      <div className="xp-window-body" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
