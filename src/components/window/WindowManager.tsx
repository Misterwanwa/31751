'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface WindowDef {
  id: string
  title: string
  icon: string
  component: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
}

interface WindowManagerCtx {
  windows: WindowDef[]
  openWindow: (def: Omit<WindowDef, 'zIndex' | 'minimized' | 'maximized'>) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, w: number, h: number) => void
}

const Ctx = createContext<WindowManagerCtx | null>(null)

let zCounter = 100

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowDef[]>([])

  const openWindow = useCallback((def: Omit<WindowDef, 'zIndex' | 'minimized' | 'maximized'>) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === def.id)
      if (existing) {
        // Bring to front and restore
        zCounter++
        return prev.map(w => w.id === def.id ? { ...w, minimized: false, zIndex: zCounter } : w)
      }
      zCounter++
      return [...prev, { ...def, minimized: false, maximized: false, zIndex: zCounter }]
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }, [])

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      zCounter++
      return prev.map(w => w.id === id ? { ...w, zIndex: zCounter } : w)
    })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w))
  }, [])

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => {
      zCounter++
      return prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: zCounter } : w)
    })
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))
  }, [])

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w))
  }, [])

  return (
    <Ctx.Provider value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, maximizeWindow, moveWindow, resizeWindow }}>
      {children}
    </Ctx.Provider>
  )
}

export function useWindowManager() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return ctx
}
