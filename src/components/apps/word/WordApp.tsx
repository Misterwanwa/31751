'use client'
import { useState, useEffect, useRef } from 'react'

const CLIPPY_MESSAGES = [
  'Es sieht so aus, als würden Sie einen Brief schreiben. Möchten Sie Hilfe?',
  'Tipp: Drücken Sie Strg+S, um Ihr Dokument zu speichern!',
  'Wussten Sie? Sie können Tabellen über das Menü "Tabelle" einfügen.',
  'Es scheint, als schreiben Sie gerade. Benötigen Sie Hilfe bei der Formatierung?',
  'Ich bin Clippy! Ihr persönlicher Assistent. Wie kann ich helfen?',
  'Möchten Sie einen Umschlag für Ihren Brief drucken?',
  'Tipp: AutoKorrektur kann häufige Tippfehler automatisch korrigieren.',
  'Benötigen Sie Hilfe beim Erstellen eines Lebenslaufs?',
]

const TOOLBAR_GROUPS = [
  ['💾 Neu', '📂 Öffnen', '💾 Speichern', '🖨️ Drucken'],
  ['✂️', '📋', '📄'],
  ['↩️', '↪️'],
  ['🔍 Suchen'],
]

type FontSize = 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 36 | 48 | 72

export default function WordApp() {
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [fontSize, setFontSize] = useState<FontSize>(12)
  const [fontFamily, setFontFamily] = useState('Times New Roman')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left')
  const [clippyMsg, setClippyMsg] = useState(CLIPPY_MESSAGES[0])
  const [clippyVisible, setClippyVisible] = useState(true)
  const [clippyAnimState, setClippyAnimState] = useState<'idle' | 'wave' | 'think'>('idle')
  const [zoom, setZoom] = useState(100)
  const editorRef = useRef<HTMLDivElement>(null)
  const clippyTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)

    if (content.length > 0 && content.length % 20 === 0) {
      triggerClippy()
    }
  }, [content])

  function triggerClippy() {
    setClippyAnimState('wave')
    setClippyMsg(CLIPPY_MESSAGES[Math.floor(Math.random() * CLIPPY_MESSAGES.length)])
    setClippyVisible(true)
    clearTimeout(clippyTimer.current)
    setTimeout(() => setClippyAnimState('idle'), 1000)
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: '#ECE9D8' }}>
      {/* Menu bar */}
      <div className="xp-menubar">
        {['Datei', 'Bearbeiten', 'Ansicht', 'Einfügen', 'Format', 'Extras', 'Tabelle', 'Fenster', 'Hilfe'].map(m => (
          <span key={m} className="xp-menu-item">{m}</span>
        ))}
      </div>

      {/* Toolbar 1 */}
      <div className="xp-toolbar" style={{ padding: '2px 4px' }}>
        {['💾', '📂', '💾', '🖨️', '🔎'].map((icon, i) => (
          <button key={i} className="xp-btn" style={{ padding: '2px 6px', fontSize: 13 }} title={['Neu', 'Öffnen', 'Speichern', 'Drucken', 'Seitenansicht'][i]}>
            {icon}
          </button>
        ))}
        <div className="xp-separator" />
        {['✂️', '📋', '📄'].map((icon, i) => (
          <button key={i} className="xp-btn" style={{ padding: '2px 6px', fontSize: 13 }}>{icon}</button>
        ))}
        <div className="xp-separator" />
        {['↩️', '↪️'].map((icon, i) => (
          <button key={i} className="xp-btn" style={{ padding: '2px 6px', fontSize: 13 }}>{icon}</button>
        ))}
        <div className="xp-separator" />
        <button className="xp-btn" style={{ padding: '2px 6px', fontSize: 11 }} onClick={triggerClippy}>❓ Clippy</button>
      </div>

      {/* Toolbar 2: Formatting */}
      <div className="xp-toolbar" style={{ padding: '2px 4px' }}>
        <select className="xp-select" style={{ width: 160, fontSize: 11 }} value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
          {['Times New Roman', 'Arial', 'Courier New', 'Comic Sans MS', 'Tahoma', 'Verdana', 'Georgia'].map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select className="xp-select" style={{ width: 50, fontSize: 11 }} value={fontSize} onChange={e => setFontSize(Number(e.target.value) as FontSize)}>
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="xp-separator" />
        {[
          { label: 'F', title: 'Fett', active: bold, onClick: () => { setBold(b => !b); execCmd('bold') }, style: { fontWeight: 'bold' } },
          { label: 'K', title: 'Kursiv', active: italic, onClick: () => { setItalic(i => !i); execCmd('italic') }, style: { fontStyle: 'italic' } },
          { label: 'U', title: 'Unterstrichen', active: underline, onClick: () => { setUnderline(u => !u); execCmd('underline') }, style: { textDecoration: 'underline' } },
        ].map(btn => (
          <button
            key={btn.label}
            className={`xp-btn${btn.active ? ' xp-btn-primary' : ''}`}
            style={{ padding: '2px 8px', fontSize: 12, minWidth: 26, ...btn.style }}
            onClick={btn.onClick}
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
        <div className="xp-separator" />
        {(['left', 'center', 'right', 'justify'] as const).map((a, i) => (
          <button
            key={a}
            className={`xp-btn${align === a ? ' xp-btn-primary' : ''}`}
            style={{ padding: '2px 6px', fontSize: 13 }}
            onClick={() => { setAlign(a); execCmd('justify' + a.charAt(0).toUpperCase() + a.slice(1)) }}
            title={['Links', 'Zentriert', 'Rechts', 'Blocksatz'][i]}
          >
            {['≡', '≡', '≡', '≡'][i]}
          </button>
        ))}
      </div>

      {/* Ruler */}
      <div style={{
        height: 20, background: '#F0EFE6', borderBottom: '1px solid #ACA899',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: '#ACA899' }} />
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i + 1) * 5}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: i % 2 === 0 ? 8 : 5, width: 1, background: '#716F64', marginTop: i % 2 === 0 ? 6 : 8 }} />
            {i % 4 === 3 && <span style={{ fontSize: 8, color: '#716F64', marginTop: 1 }}>{Math.ceil((i + 1) / 4)}</span>}
          </div>
        ))}
      </div>

      {/* Document area */}
      <div style={{ flex: 1, background: '#808080', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px 0', position: 'relative' }}>
        {/* Page */}
        <div style={{
          width: Math.round(794 * zoom / 100),
          minHeight: Math.round(1123 * zoom / 100),
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          padding: `${Math.round(80 * zoom / 100)}px ${Math.round(100 * zoom / 100)}px`,
          position: 'relative',
          flexShrink: 0,
        }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setContent(e.currentTarget.textContent || '')}
            style={{
              minHeight: Math.round(900 * zoom / 100),
              outline: 'none',
              fontSize: Math.round(fontSize * zoom / 100),
              fontFamily: fontFamily,
              textAlign: align,
              lineHeight: 1.8,
              color: '#000',
              wordBreak: 'break-word',
            }}
            data-placeholder="Klicken Sie hier, um mit der Eingabe zu beginnen..."
          />
          {content === '' && (
            <div style={{
              position: 'absolute', top: Math.round(80 * zoom / 100), left: Math.round(100 * zoom / 100),
              color: '#999', fontSize: Math.round(fontSize * zoom / 100), fontFamily, pointerEvents: 'none',
            }}>
              Klicken Sie hier, um mit der Eingabe zu beginnen...
            </div>
          )}
        </div>

        {/* Clippy */}
        {clippyVisible && (
          <div style={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            animation: clippyAnimState === 'wave' ? 'none' : undefined,
          }}>
            {/* Speech bubble */}
            <div style={{
              background: '#FFFFE1',
              border: '1px solid #000',
              borderRadius: 6,
              padding: '8px 10px',
              maxWidth: 220,
              fontSize: 11,
              boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
              position: 'relative',
              lineHeight: 1.5,
            }}>
              {clippyMsg}
              {/* Arrow */}
              <div style={{
                position: 'absolute', bottom: -8, right: 20,
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #000',
              }} />
              <div style={{
                position: 'absolute', bottom: -7, right: 21,
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid #FFFFE1',
              }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <button className="xp-btn" style={{ fontSize: 9, padding: '1px 5px' }} onClick={() => triggerClippy()}>
                  Ja
                </button>
                <button className="xp-btn" style={{ fontSize: 9, padding: '1px 5px' }} onClick={() => setClippyVisible(false)}>
                  Nein
                </button>
                <button className="xp-btn" style={{ fontSize: 9, padding: '1px 5px' }} onClick={() => setClippyVisible(false)}>
                  Schließen
                </button>
              </div>
            </div>

            {/* Clippy character */}
            <div
              style={{
                fontSize: clippyAnimState === 'wave' ? 60 : 56,
                cursor: 'pointer',
                transition: 'font-size 0.2s',
                filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))',
                transform: clippyAnimState === 'wave' ? 'rotate(-15deg)' : 'rotate(0deg)',
                transition2: 'transform 0.3s',
              } as React.CSSProperties}
              onClick={triggerClippy}
              title="Klicken für Hilfe"
            >
              📎
            </div>
          </div>
        )}
        {!clippyVisible && (
          <div
            style={{ position: 'fixed', bottom: 80, right: 24, fontSize: 40, cursor: 'pointer', opacity: 0.6 }}
            onClick={triggerClippy}
            title="Clippy einblenden"
          >
            📎
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <div className="xp-statusbar-panel">Seite 1 Abschn. 1</div>
        <div className="xp-statusbar-panel">1/1</div>
        <div className="xp-statusbar-panel">Bei 2,5cm</div>
        <div className="xp-statusbar-panel">Wörter: {wordCount}</div>
        <div className="xp-statusbar-panel">Zeichen: {content.length}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Zoom:</span>
          <select className="xp-select" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ fontSize: 10 }}>
            {[50, 75, 100, 125, 150].map(z => <option key={z} value={z}>{z}%</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
