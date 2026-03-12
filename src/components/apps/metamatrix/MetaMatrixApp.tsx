'use client'
import { useState, useRef, useCallback } from 'react'

type Level = 'M0' | 'M1' | 'M2'

interface Term {
  id: string
  text: string
  correctLevel: Level
  placedLevel: Level | null
  x: number
  y: number
}

interface Connection {
  fromId: string
  toId: string
  label: string
}

const SCENARIOS = [
  {
    title: 'Fahrzeuge & Klassen',
    description: 'Ordne Begriffe den richtigen Modellierungsebenen zu.',
    terms: [
      { id: 't1', text: 'Mein Golf\n(Kennzeichen: HA-XY 123)', correctLevel: 'M0' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 't2', text: 'Maria\'s BMW\n(Kennzeichen: MÜ-AB 456)', correctLevel: 'M0' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 't3', text: 'Klasse: PKW', correctLevel: 'M1' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 't4', text: 'Klasse: Fahrzeug', correctLevel: 'M1' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 't5', text: 'Metaklasse: Entitätstyp', correctLevel: 'M2' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 't6', text: 'Metaklasse: Klasse', correctLevel: 'M2' as Level, placedLevel: null, x: 0, y: 0 },
    ],
    connections: [
      { fromId: 't1', toId: 't3', label: 'instance of' },
      { fromId: 't2', toId: 't3', label: 'instance of' },
      { fromId: 't3', toId: 't5', label: 'instance of' },
      { fromId: 't4', toId: 't5', label: 'instance of' },
    ],
  },
  {
    title: 'Personen & Mitarbeiter',
    description: 'Wähle die korrekten Ebenen für Instanzen, Klassen und Metaklassen.',
    terms: [
      { id: 'p1', text: 'Mitarbeiter Hans Müller\n(PersNr: 42)', correctLevel: 'M0' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 'p2', text: 'Mitarbeiterin Anna Schmidt\n(PersNr: 17)', correctLevel: 'M0' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 'p3', text: 'Objekttyp: Mitarbeiter', correctLevel: 'M1' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 'p4', text: 'Objekttyp: Person', correctLevel: 'M1' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 'p5', text: 'Metamodellkonzept:\nObjekttyp', correctLevel: 'M2' as Level, placedLevel: null, x: 0, y: 0 },
      { id: 'p6', text: 'UML-Konstrukt: Klasse', correctLevel: 'M2' as Level, placedLevel: null, x: 0, y: 0 },
    ],
    connections: [
      { fromId: 'p1', toId: 'p3', label: 'instance of' },
      { fromId: 'p2', toId: 'p3', label: 'instance of' },
      { fromId: 'p3', toId: 'p5', label: 'instance of' },
      { fromId: 'p4', toId: 'p5', label: 'instance of' },
    ],
  },
]

const LEVEL_COLORS: Record<Level, { bg: string; border: string; label: string; desc: string }> = {
  M0: { bg: '#E8F5E9', border: '#4CAF50', label: 'M0 – Realität / Instanzen', desc: 'Konkrete Objekte der realen Welt' },
  M1: { bg: '#E3F2FD', border: '#2196F3', label: 'M1 – Modellebene / Klassen', desc: 'Beschreibungen / Typen / Klassen' },
  M2: { bg: '#FFF3E0', border: '#FF9800', label: 'M2 – Metamodellebene', desc: 'Modellierungskonzepte (UML, ERM, ...)' },
}

export default function MetaMatrixApp() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [terms, setTerms] = useState<Term[]>(() => SCENARIOS[0].terms.map(t => ({ ...t })))
  const [drawingConn, setDrawingConn] = useState<string | null>(null)
  const [userConns, setUserConns] = useState<Connection[]>([])
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState<{ levelScore: number; connScore: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const scenario = SCENARIOS[scenarioIdx]

  const LEVELS: Level[] = ['M0', 'M1', 'M2']

  function dropOnLevel(level: Level, e: React.DragEvent) {
    e.preventDefault()
    if (!draggingId) return
    setTerms(prev => prev.map(t => t.id === draggingId ? { ...t, placedLevel: level } : t))
    setDraggingId(null)
    setChecked(false)
  }

  function startConnect(termId: string) {
    if (drawingConn === null) {
      setDrawingConn(termId)
    } else if (drawingConn !== termId) {
      // Add connection if not already exists
      const exists = userConns.some(c =>
        (c.fromId === drawingConn && c.toId === termId) ||
        (c.fromId === termId && c.toId === drawingConn)
      )
      if (!exists) {
        setUserConns(prev => [...prev, { fromId: drawingConn, toId: termId, label: 'instance of' }])
      }
      setDrawingConn(null)
    } else {
      setDrawingConn(null)
    }
  }

  function removeConn(idx: number) {
    setUserConns(prev => prev.filter((_, i) => i !== idx))
  }

  function checkAnswers() {
    const levelScore = terms.filter(t => t.placedLevel === t.correctLevel).length
    const correctConns = scenario.connections
    let connScore = 0
    for (const cc of correctConns) {
      const found = userConns.some(uc =>
        (uc.fromId === cc.fromId && uc.toId === cc.toId) ||
        (uc.fromId === cc.toId && uc.toId === cc.fromId)
      )
      if (found) connScore++
    }
    setScore({ levelScore, connScore })
    setChecked(true)
  }

  function loadScenario(idx: number) {
    setScenarioIdx(idx)
    setTerms(SCENARIOS[idx].terms.map(t => ({ ...t })))
    setUserConns([])
    setChecked(false)
    setScore(null)
    setDrawingConn(null)
  }

  const totalPlaced = terms.filter(t => t.placedLevel !== null).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* Toolbar */}
      <div className="xp-toolbar" style={{ gap: 8, flexShrink: 0 }}>
        <span style={{ fontWeight: 'bold', marginRight: 4 }}>Szenario:</span>
        {SCENARIOS.map((s, i) => (
          <button key={i} className={`xp-btn${i === scenarioIdx ? ' xp-btn-primary' : ''}`} onClick={() => loadScenario(i)}>
            {i + 1}. {s.title}
          </button>
        ))}
        <div className="xp-separator" />
        <button className="xp-btn" onClick={checkAnswers} disabled={totalPlaced < terms.length}>
          🔍 Auswerten
        </button>
        <button className="xp-btn" onClick={() => loadScenario(scenarioIdx)}>↺ Reset</button>
        {drawingConn && (
          <span style={{ color: '#1A4DAA', fontWeight: 'bold', marginLeft: 8 }}>
            🔗 Verbinde mit... (Klicke auf zweiten Begriff oder Esc)
          </span>
        )}
        {checked && score && (
          <span style={{
            marginLeft: 8, color: score.levelScore + score.connScore === terms.length + scenario.connections.length ? '#28A745' : '#DC3545',
            fontWeight: 'bold',
          }}>
            ✓ Ebenen: {score.levelScore}/{terms.length} | Verbindungen: {score.connScore}/{scenario.connections.length}
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{ padding: '6px 12px', background: '#F0EFE6', borderBottom: '1px solid #ACA899', fontSize: 11, color: '#333' }}>
        <strong>{scenario.title}:</strong> {scenario.description}
        <span style={{ marginLeft: 16, color: '#716F64' }}>
          Ziehe die Begriffe in die richtige Ebene. Klicke dann auf 🔗 neben einem Begriff, um Verbindungen zu zeichnen.
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: term pool */}
        <div style={{
          width: 180, borderRight: '1px solid #ACA899', padding: 8, overflowY: 'auto',
          background: '#F8F7F0', flexShrink: 0,
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#333' }}>📦 Begriffe</div>
          {terms.filter(t => t.placedLevel === null).map(term => (
            <div
              key={term.id}
              draggable
              onDragStart={() => setDraggingId(term.id)}
              style={{
                padding: '6px 8px', margin: '4px 0',
                background: drawingConn === term.id ? '#FFF3CD' : 'white',
                border: `2px solid ${drawingConn === term.id ? '#FFC107' : '#ACA899'}`,
                borderRadius: 4, cursor: 'grab',
                fontSize: 10, lineHeight: 1.4, whiteSpace: 'pre-wrap',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {term.text}
            </div>
          ))}
          {terms.filter(t => t.placedLevel === null).length === 0 && (
            <div style={{ color: '#888', fontSize: 10, textAlign: 'center', marginTop: 12 }}>Alle platziert ✅</div>
          )}
        </div>

        {/* Main: three level zones */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: 8, gap: 8 }}>
          {LEVELS.map(level => {
            const lc = LEVEL_COLORS[level]
            const levelTerms = terms.filter(t => t.placedLevel === level)
            return (
              <div
                key={level}
                onDragOver={e => e.preventDefault()}
                onDrop={e => dropOnLevel(level, e)}
                style={{
                  flex: 1, minHeight: 120,
                  background: lc.bg,
                  border: `2px dashed ${lc.border}`,
                  borderRadius: 6,
                  padding: 8,
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: 6, left: 8,
                  fontWeight: 'bold', fontSize: 12, color: lc.border,
                }}>
                  {lc.label}
                </div>
                <div style={{
                  position: 'absolute', top: 6, right: 8,
                  fontSize: 10, color: '#888',
                }}>
                  {lc.desc}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
                  {levelTerms.map(term => {
                    const isCorrect = checked ? term.correctLevel === level : null
                    return (
                      <div
                        key={term.id}
                        draggable
                        onDragStart={() => setDraggingId(term.id)}
                        style={{
                          padding: '6px 10px',
                          background: checked
                            ? isCorrect ? '#D4EDDA' : '#F8D7DA'
                            : drawingConn === term.id ? '#FFF3CD' : 'white',
                          border: `2px solid ${
                            checked
                              ? isCorrect ? '#28A745' : '#DC3545'
                              : drawingConn === term.id ? '#FFC107' : lc.border
                          }`,
                          borderRadius: 4,
                          cursor: 'grab',
                          fontSize: 10, lineHeight: 1.4, whiteSpace: 'pre-wrap',
                          boxShadow: '1px 1px 3px rgba(0,0,0,0.15)',
                          position: 'relative',
                        }}
                      >
                        {term.text}
                        {checked && !isCorrect && (
                          <div style={{ fontSize: 9, color: '#DC3545', marginTop: 2 }}>
                            → Korrekt: {term.correctLevel}
                          </div>
                        )}
                        {/* Connect button */}
                        <button
                          onClick={e => { e.stopPropagation(); startConnect(term.id) }}
                          title="Verbindung ziehen"
                          style={{
                            position: 'absolute', top: 2, right: 2,
                            background: drawingConn === term.id ? '#FFC107' : '#EEF4FF',
                            border: '1px solid #ACA899',
                            borderRadius: 3, padding: '0 3px',
                            fontSize: 10, cursor: 'pointer', lineHeight: 1.5,
                          }}
                        >
                          🔗
                        </button>
                      </div>
                    )
                  })}
                  {levelTerms.length === 0 && (
                    <div style={{ color: '#AAA', fontSize: 10, paddingTop: 4 }}>
                      ← Begriffe hierher ziehen
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: connections panel */}
        <div style={{
          width: 200, borderLeft: '1px solid #ACA899', padding: 8, overflowY: 'auto',
          background: '#F8F7F0', flexShrink: 0,
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#333' }}>🔗 Verbindungen</div>
          {userConns.length === 0 && (
            <div style={{ color: '#888', fontSize: 10 }}>
              Klicke auf 🔗 bei zwei Begriffen, um "instance of" Verbindungen zu zeichnen.
            </div>
          )}
          {userConns.map((conn, i) => {
            const from = terms.find(t => t.id === conn.fromId)
            const to = terms.find(t => t.id === conn.toId)
            const isCorrect = checked
              ? scenario.connections.some(cc =>
                  (cc.fromId === conn.fromId && cc.toId === conn.toId) ||
                  (cc.fromId === conn.toId && cc.toId === conn.fromId)
                )
              : null
            return (
              <div key={i} style={{
                padding: '5px 6px', marginBottom: 4,
                background: checked ? (isCorrect ? '#D4EDDA' : '#F8D7DA') : 'white',
                border: `1px solid ${checked ? (isCorrect ? '#28A745' : '#DC3545') : '#ACA899'}`,
                borderRadius: 3, fontSize: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{from?.text.split('\n')[0]}</span>
                  <button
                    onClick={() => removeConn(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545', fontSize: 12 }}
                  >×</button>
                </div>
                <div style={{ color: '#666', textAlign: 'center' }}>↓ {conn.label}</div>
                <div style={{ fontWeight: 'bold' }}>{to?.text.split('\n')[0]}</div>
              </div>
            )
          })}
          {checked && score && (
            <div style={{ marginTop: 8, padding: 8, background: '#EEF4FF', border: '1px solid #316AC5', borderRadius: 4 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Korrekte Verbindungen:</div>
              {scenario.connections.map((cc, i) => {
                const from = terms.find(t => t.id === cc.fromId)
                const to = terms.find(t => t.id === cc.toId)
                return (
                  <div key={i} style={{ fontSize: 9, marginBottom: 3, color: '#333' }}>
                    {from?.text.split('\n')[0]} → {to?.text.split('\n')[0]}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
