'use client'
import { useState } from 'react'

interface Props {
  icon: string
  label: string
  onOpen: () => void
}

export default function DesktopIcon({ icon, label, onOpen }: Props) {
  const [selected, setSelected] = useState(false)
  const [lastClick, setLastClick] = useState(0)

  function handleClick() {
    const now = Date.now()
    if (now - lastClick < 400) {
      onOpen()
      setSelected(false)
    } else {
      setSelected(s => !s)
    }
    setLastClick(now)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '6px 4px',
        borderRadius: 4,
        cursor: 'default',
        width: 80,
        background: selected ? 'rgba(49,106,197,0.4)' : 'transparent',
        border: selected ? '1px dotted rgba(255,255,255,0.8)' : '1px solid transparent',
      }}
    >
      <span style={{ fontSize: 36, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: 11,
          color: 'white',
          textAlign: 'center',
          wordBreak: 'break-word',
          textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
          lineHeight: 1.3,
          background: selected ? 'rgba(49,106,197,0.7)' : 'transparent',
          padding: '1px 3px',
          borderRadius: 2,
        }}
      >
        {label}
      </span>
    </div>
  )
}
