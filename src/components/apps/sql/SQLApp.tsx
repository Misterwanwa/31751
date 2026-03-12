'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  sampleDatabases, sqlExercises, executeSQL, formatASCIITable,
  formatASCIITableFromTable, Table
} from '@/lib/sql-parser'

interface HistoryLine {
  type: 'input' | 'output' | 'error' | 'info'
  text: string
}

const DB_NAMES = Object.keys(sampleDatabases)

export default function SQLApp() {
  const [dbName, setDbName] = useState(DB_NAMES[0])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryLine[]>([])
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const tables = sampleDatabases[dbName]
  const exercise = sqlExercises[exerciseIdx]

  useEffect(() => {
    setHistory([
      { type: 'info', text: '═══════════════════════════════════════════════════════════════' },
      { type: 'info', text: ' Microsoft Windows XP [Version 5.1.2600]' },
      { type: 'info', text: ' SQL & Relationenalgebra Trainingsumgebung' },
      { type: 'info', text: '═══════════════════════════════════════════════════════════════' },
      { type: 'info', text: '' },
      { type: 'info', text: ` Aktive Datenbank: ${dbName}` },
      { type: 'info', text: ` Verfügbare Tabellen: ${tables.map(t => t.name).join(', ')}` },
      { type: 'info', text: '' },
      { type: 'info', text: ' Befehle:' },
      { type: 'info', text: '   SHOW TABLES        – alle Tabellen anzeigen' },
      { type: 'info', text: '   SHOW <tabelle>     – Inhalt einer Tabelle anzeigen' },
      { type: 'info', text: '   EXERCISE           – aktuelle Aufgabe anzeigen' },
      { type: 'info', text: '   NEXT               – nächste Aufgabe' },
      { type: 'info', text: '   HELP               – Hilfe anzeigen' },
      { type: 'info', text: '   CLS                – Bildschirm löschen' },
      { type: 'info', text: '' },
    ])
  }, [dbName, tables])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  function processCommand(cmd: string) {
    const trimmed = cmd.trim()
    if (!trimmed) return

    addLine({ type: 'input', text: `C:\\SQL> ${trimmed}` })
    setCmdHistory(prev => [trimmed, ...prev].slice(0, 50))
    setHistIdx(-1)

    const upper = trimmed.toUpperCase()

    if (upper === 'CLS' || upper === 'CLEAR') {
      setHistory([])
      return
    }

    if (upper === 'HELP') {
      addLines([
        { type: 'info', text: '' },
        { type: 'info', text: 'Unterstützte SQL-Syntax:' },
        { type: 'info', text: '  SELECT col1, col2 FROM tabelle' },
        { type: 'info', text: '  SELECT * FROM tabelle WHERE bedingung' },
        { type: 'info', text: '  SELECT t1.col FROM t1 JOIN t2 ON t1.key = t2.key' },
        { type: 'info', text: '  SELECT t1.col FROM t1 JOIN t2 ON t1.key = t2.key WHERE ...' },
        { type: 'info', text: '' },
        { type: 'info', text: 'Operatoren in WHERE: =  !=  <  >  <=  >=' },
        { type: 'info', text: '' },
      ])
      return
    }

    if (upper === 'SHOW TABLES') {
      addLine({ type: 'info', text: '' })
      for (const t of tables) {
        addLine({ type: 'output', text: `  ${t.name} (${t.columns.join(', ')})` })
      }
      addLine({ type: 'info', text: '' })
      return
    }

    if (upper.startsWith('SHOW ')) {
      const tname = trimmed.slice(5).trim()
      const tbl = tables.find(t => t.name.toLowerCase() === tname.toLowerCase())
      if (!tbl) {
        addLine({ type: 'error', text: `Fehler: Tabelle '${tname}' nicht gefunden.` })
        return
      }
      addLine({ type: 'info', text: '' })
      addLine({ type: 'output', text: formatASCIITableFromTable(tbl) })
      addLine({ type: 'info', text: ` ${tbl.rows.length} Zeile(n)` })
      addLine({ type: 'info', text: '' })
      return
    }

    if (upper === 'EXERCISE' || upper === 'AUFGABE') {
      addLines([
        { type: 'info', text: '' },
        { type: 'info', text: `Aufgabe ${exerciseIdx + 1} von ${sqlExercises.length}:` },
        { type: 'info', text: `  ${exercise.description}` },
        ...(exercise.hint ? [{ type: 'info' as const, text: `  Hinweis: ${exercise.hint}` }] : []),
        { type: 'info', text: '' },
      ])
      return
    }

    if (upper === 'NEXT' || upper === 'WEITER') {
      if (exerciseIdx + 1 < sqlExercises.length) {
        setExerciseIdx(i => i + 1)
        const next = sqlExercises[exerciseIdx + 1]
        addLines([
          { type: 'info', text: '' },
          { type: 'info', text: `Nächste Aufgabe (${exerciseIdx + 2} von ${sqlExercises.length}):` },
          { type: 'info', text: `  ${next.description}` },
          { type: 'info', text: '' },
        ])
      } else {
        addLine({ type: 'info', text: 'Alle Aufgaben abgeschlossen! Tippe CLS und starte neu.' })
      }
      return
    }

    if (upper === 'ANSWER' || upper === 'LÖSUNG' || upper === 'LOESUNG') {
      addLines([
        { type: 'info', text: '' },
        { type: 'info', text: 'Musterlösung:' },
        { type: 'info', text: `  ${exercise.sampleAnswer}` },
        { type: 'info', text: '' },
      ])
      return
    }

    // Execute SQL
    if (upper.startsWith('SELECT')) {
      const result = executeSQL(trimmed, tables)
      addLine({ type: 'info', text: '' })
      if ('error' in result) {
        addLine({ type: 'error', text: `Fehler: ${result.error}` })
      } else {
        if (result.rows.length === 0) {
          addLine({ type: 'output', text: '(Keine Ergebnisse)\n' })
        } else {
          addLine({ type: 'output', text: formatASCIITable(result.columns, result.rows) })
          addLine({ type: 'info', text: ` ${result.rows.length} Zeile(n) gefunden.` })
        }
      }
      addLine({ type: 'info', text: '' })
      return
    }

    addLine({ type: 'error', text: `'${trimmed}' wird nicht als interner oder externer Befehl erkannt.` })
  }

  function addLine(line: HistoryLine) {
    setHistory(prev => [...prev, line])
  }
  function addLines(lines: HistoryLine[]) {
    setHistory(prev => [...prev, ...lines])
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      processCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(newIdx)
      if (cmdHistory[newIdx]) setInput(cmdHistory[newIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIdx = Math.max(histIdx - 1, -1)
      setHistIdx(newIdx)
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx])
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1A1A1A' }}>
      {/* Top: tables viewer */}
      <div style={{
        background: '#0C0C0C',
        borderBottom: '1px solid #333',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ color: '#C0C0C0', fontSize: 10, fontFamily: 'Courier New, monospace' }}>DB:</span>
        {DB_NAMES.map(n => (
          <button
            key={n}
            onClick={() => setDbName(n)}
            style={{
              background: n === dbName ? '#316AC5' : '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: 2,
              padding: '2px 8px',
              fontSize: 10,
              fontFamily: 'Courier New, monospace',
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, overflow: 'auto' }}>
          {tables.map(t => (
            <button
              key={t.name}
              onClick={() => processCommand(`SHOW ${t.name}`)}
              title={`SHOW ${t.name}`}
              style={{
                background: '#1A3A1A',
                color: '#90EE90',
                border: '1px solid #2A5A2A',
                borderRadius: 2,
                padding: '2px 8px',
                fontSize: 10,
                fontFamily: 'Courier New, monospace',
                cursor: 'pointer',
              }}
            >
              📋 {t.name}
            </button>
          ))}
          <button
            onClick={() => processCommand('EXERCISE')}
            style={{
              background: '#2A2A1A',
              color: '#FFFF90',
              border: '1px solid #5A5A2A',
              borderRadius: 2,
              padding: '2px 8px',
              fontSize: 10,
              fontFamily: 'Courier New, monospace',
              cursor: 'pointer',
            }}
          >
            📝 Aufgabe {exerciseIdx + 1}
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={outputRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px 12px',
          fontFamily: 'Courier New, Lucida Console, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          cursor: 'text',
        }}
      >
        {history.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.type === 'input' ? '#FFFFFF'
                : line.type === 'error' ? '#FF6060'
                : line.type === 'output' ? '#90EE90'
                : '#C0C0C0',
              whiteSpace: 'pre',
            }}
          >
            {line.text}
          </div>
        ))}
        {/* Cursor line */}
        <div style={{ display: 'flex', alignItems: 'center', color: '#FFFFFF', whiteSpace: 'pre' }}>
          <span>C:\SQL&gt; </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontFamily: 'Courier New, Lucida Console, monospace',
              fontSize: 12,
              caretColor: 'white',
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
