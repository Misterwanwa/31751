'use client'

interface AppEntry {
  id: string
  icon: string
  label: string
  onOpen: () => void
}

interface Props {
  apps: AppEntry[]
  onClose: () => void
}

export default function StartMenu({ apps, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={onClose} />

      {/* Menu */}
      <div style={{
        position: 'fixed',
        bottom: 40,
        left: 0,
        width: 320,
        background: '#ECE9D8',
        border: '2px solid #0A246A',
        borderRadius: '8px 8px 0 0',
        zIndex: 999,
        boxShadow: '3px 0 8px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #0A246A, #3D84E0)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 40 }}>👤</span>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Student</div>
            <div style={{ color: '#A6CAF0', fontSize: 11 }}>WI Lernplattform</div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex' }}>
          {/* Left: pinned programs */}
          <div style={{ flex: 1, borderRight: '1px solid #ACA899', padding: '8px 0' }}>
            <div style={{ padding: '2px 12px 6px', fontSize: 10, color: '#716F64', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1 }}>
              Lernprogramme
            </div>
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => { app.onOpen(); onClose() }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '6px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 11,
                  fontFamily: 'Tahoma, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#316AC5', e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none', e.currentTarget.style.color = 'black')}
              >
                <span style={{ fontSize: 20 }}>{app.icon}</span>
                <span style={{ lineHeight: 1.3, fontWeight: 500 }}>{app.label}</span>
              </button>
            ))}
          </div>

          {/* Right: system */}
          <div style={{ width: 140, padding: '8px 0', background: '#BFCFEF' }}>
            <div style={{ padding: '2px 12px 6px', fontSize: 10, color: '#0A246A', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1 }}>
              System
            </div>
            {[
              { icon: '🖥️', label: 'Arbeitsplatz' },
              { icon: '📁', label: 'Eigene Dateien' },
              { icon: '🌐', label: 'Internet Explorer' },
            ].map(item => (
              <button
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '5px 12px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontSize: 11, fontFamily: 'Tahoma, sans-serif',
                  color: '#000',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#316AC5', e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none', e.currentTarget.style.color = '#000')}
                onClick={onClose}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'linear-gradient(to right, #0A246A, #3D84E0)',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', fontSize: 11, padding: '3px 10px', borderRadius: 3,
              cursor: 'pointer', fontFamily: 'Tahoma, sans-serif', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span>⏻</span> Beenden
          </button>
        </div>
      </div>
    </>
  )
}
