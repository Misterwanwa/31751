'use client'
import { useState, useCallback } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, Handle, Position, NodeProps, EdgeProps,
  getStraightPath, BaseEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { erdCaseStudies } from '@/lib/case-studies'

// ===== Node types =====
function EntityNode({ data, selected }: NodeProps) {
  const d = data as { name: string; attributes: { name: string; isKey: boolean }[] }
  return (
    <div style={{
      background: 'white', border: `2px solid ${selected ? '#316AC5' : '#333'}`,
      padding: '6px 12px', minWidth: 120, textAlign: 'center',
      fontFamily: 'Tahoma, sans-serif', fontSize: 11,
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{d.name}</div>
      {d.attributes?.length > 0 && (
        <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {d.attributes.map((a: { name: string; isKey: boolean }, i: number) => (
            <span key={i} style={{
              fontSize: 9, background: a.isKey ? '#FFF3CD' : '#F0EFE6',
              border: '1px solid #ACA899', borderRadius: 2, padding: '1px 4px',
              textDecoration: a.isKey ? 'underline' : 'none',
            }}>
              {a.isKey ? '🔑 ' : ''}{a.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function RelationNode({ data, selected }: NodeProps) {
  const d = data as { name: string }
  return (
    <div style={{
      width: 100, height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Tahoma, sans-serif', fontSize: 11, fontWeight: 'bold',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <polygon
          points="50,2 98,30 50,58 2,30"
          fill={selected ? '#EEF4FF' : 'white'}
          stroke={selected ? '#316AC5' : '#333'}
          strokeWidth={2}
        />
      </svg>
      <span style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>{d.name}</span>
    </div>
  )
}

function AttributeNode({ data, selected }: NodeProps) {
  const d = data as { name: string; isKey: boolean }
  return (
    <div style={{
      background: d.isKey ? '#FFF9E7' : 'white',
      border: `2px solid ${selected ? '#316AC5' : d.isKey ? '#FFC107' : '#888'}`,
      borderRadius: '50%', padding: '6px 10px',
      fontFamily: 'Tahoma, sans-serif', fontSize: 10,
      textDecoration: d.isKey ? 'underline' : 'none',
      minWidth: 80, textAlign: 'center',
      boxShadow: selected ? '0 0 0 2px #316AC599' : '1px 1px 3px rgba(0,0,0,0.1)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      {d.isKey && <span>🔑 </span>}{d.name}
    </div>
  )
}

const nodeTypes = { entityNode: EntityNode, relationNode: RelationNode, attributeNode: AttributeNode }

// Cardinality edge
function CardEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const [path, lx, ly] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const d = data as { card: string; notation: string } | undefined
  return (
    <>
      <BaseEdge id={id} path={path} style={{ strokeWidth: 1.5, stroke: '#333' }} />
      <text x={lx} y={ly} textAnchor="middle" style={{ fontSize: 11, fontFamily: 'Tahoma, sans-serif', fontWeight: 'bold', fill: '#1A4DAA' }}>
        {d?.card}
      </text>
    </>
  )
}

const edgeTypes = { cardEdge: CardEdge }

// ===== Generalization Manager Dialog =====
function GeneralizationDialog({ onClose, onSave }: { onClose: () => void; onSave: (data: { complete: boolean; exclusive: boolean; reason: string }) => void }) {
  const [complete, setComplete] = useState(false)
  const [exclusive, setExclusive] = useState(false)
  const [reason, setReason] = useState('')
  return (
    <div className="xp-dialog-overlay">
      <div className="xp-dialog" style={{ width: 420 }}>
        <div className="xp-window-titlebar">
          <span style={{ fontSize: 14 }}>🌳</span>
          <span className="xp-window-title">Generalisierungs-Manager</span>
        </div>
        <div className="xp-dialog-body">
          <div style={{ background: '#EEF4FF', border: '1px solid #316AC5', borderRadius: 3, padding: 8, marginBottom: 12, fontSize: 10 }}>
            Sie haben eine Generalisierungsbeziehung gezeichnet. Bitte treffen Sie die Modellierungsentscheidungen:
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Vollständigkeit:</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'pointer' }}>
              <input type="radio" className="xp-radio" name="complete" checked={complete} onChange={() => setComplete(true)} />
              <div>
                <div style={{ fontWeight: 500 }}>Vollständig (total)</div>
                <div style={{ fontSize: 10, color: '#666' }}>Jede Instanz des Obertyps ist auch Instanz eines Untertyps</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" className="xp-radio" name="complete" checked={!complete} onChange={() => setComplete(false)} />
              <div>
                <div style={{ fontWeight: 500 }}>Unvollständig (partiell)</div>
                <div style={{ fontSize: 10, color: '#666' }}>Es kann Instanzen des Obertyps geben, die keinem Untertyp angehören</div>
              </div>
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Exklusivität (Überschneidungsfreiheit):</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'pointer' }}>
              <input type="radio" className="xp-radio" name="exclusive" checked={exclusive} onChange={() => setExclusive(true)} />
              <div>
                <div style={{ fontWeight: 500 }}>Disjunkt (exklusiv)</div>
                <div style={{ fontSize: 10, color: '#666' }}>Eine Instanz kann nur einem Untertyp angehören</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" className="xp-radio" name="exclusive" checked={!exclusive} onChange={() => setExclusive(false)} />
              <div>
                <div style={{ fontWeight: 500 }}>Überlappend (nicht-exklusiv)</div>
                <div style={{ fontSize: 10, color: '#666' }}>Eine Instanz kann mehreren Untertypen angehören</div>
              </div>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 3 }}>Begründung Ihrer Entscheidung:</label>
            <textarea
              className="xp-input"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
              placeholder="Warum ist diese Generalisierung vollständig/unvollständig und disjunkt/überlappend?"
            />
          </div>
        </div>
        <div className="xp-dialog-footer">
          <button className="xp-btn xp-btn-primary" onClick={() => onSave({ complete, exclusive, reason })}>Bestätigen</button>
          <button className="xp-btn" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

// ===== Cycle Analyzer Dialog =====
function CycleDialog({ cycle, onClose }: { cycle: string[]; onClose: (problematic: boolean) => void }) {
  const [problematic, setProblematic] = useState<boolean | null>(null)
  return (
    <div className="xp-dialog-overlay">
      <div className="xp-dialog" style={{ width: 400 }}>
        <div className="xp-window-titlebar" style={{ background: 'linear-gradient(to right, #8B0000, #CC4444)' }}>
          <span style={{ fontSize: 14 }}>🦠</span>
          <span className="xp-window-title">Modellkreis-Analyzer – Zyklus erkannt!</span>
        </div>
        <div className="xp-dialog-body">
          <div style={{ background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 3, padding: 8, marginBottom: 12 }}>
            ⚠️ <strong>Modellierungszyklus erkannt!</strong> Die folgende Beziehungskette bildet einen Kreis:
          </div>
          <div style={{ background: '#F8F7F0', border: '1px solid #ACA899', borderRadius: 3, padding: 8, marginBottom: 12, fontSize: 11 }}>
            {cycle.join(' → ')} → {cycle[0]}
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Ist dieser Zyklus problematisch?</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
            <input type="radio" className="xp-radio" name="cyc" checked={problematic === true} onChange={() => setProblematic(true)} />
            <div>
              <div style={{ fontWeight: 500, color: '#DC3545' }}>Ja, problematisch (redundant)</div>
              <div style={{ fontSize: 10, color: '#666' }}>Der Zyklus enthält redundante Informationen – eine Beziehung kann abgeleitet werden</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" className="xp-radio" name="cyc" checked={problematic === false} onChange={() => setProblematic(false)} />
            <div>
              <div style={{ fontWeight: 500, color: '#28A745' }}>Nein, unproblematisch (fachlich notwendig)</div>
              <div style={{ fontSize: 10, color: '#666' }}>Jede Beziehung im Zyklus trägt eigenständige fachliche Information</div>
            </div>
          </label>
        </div>
        <div className="xp-dialog-footer">
          <button
            className="xp-btn xp-btn-primary"
            disabled={problematic === null}
            onClick={() => problematic !== null && onClose(problematic)}
          >OK</button>
        </div>
      </div>
    </div>
  )
}

// ===== Cardinality Dialog =====
function CardDialog({
  notation, from, to,
  onClose, onSave,
}: {
  notation: 'old' | 'new'
  from: string; to: string
  onClose: () => void
  onSave: (card: string, fromCard: string) => void
}) {
  const [fromCard, setFromCard] = useState(notation === 'old' ? '1' : '(1,1)')
  const [toCard, setToCard] = useState(notation === 'old' ? 'm' : '(0,n)')
  const oldOptions = ['1', 'c', 'm', 'mc']
  const newOptions = ['(1,1)', '(0,1)', '(1,n)', '(0,n)']
  const opts = notation === 'old' ? oldOptions : newOptions
  return (
    <div className="xp-dialog-overlay">
      <div className="xp-dialog" style={{ width: 380 }}>
        <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>⬦</span><span className="xp-window-title">Kardinalität konfigurieren</span></div>
        <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: '#555' }}>
            Notation: <strong>{notation === 'old' ? 'Alt (1/c/m/mc)' : 'Neu (min,max)'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 3 }}>Kardinalität {from} → Beziehung:</label>
              <select className="xp-select" value={fromCard} onChange={e => setFromCard(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 3 }}>Kardinalität {to} → Beziehung:</label>
              <select className="xp-select" value={toCard} onChange={e => setToCard(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          {notation === 'old' && (
            <div style={{ background: '#F0EFE6', padding: 6, borderRadius: 3, fontSize: 10, color: '#555' }}>
              1=genau eins | c=kein oder eins | m=ein oder mehrere | mc=kein, ein oder mehrere
            </div>
          )}
          {notation === 'new' && (
            <div style={{ background: '#F0EFE6', padding: 6, borderRadius: 3, fontSize: 10, color: '#555' }}>
              (min,max): 1=mindestens 1 | 0=optional | n=beliebig viele
            </div>
          )}
        </div>
        <div className="xp-dialog-footer">
          <button className="xp-btn xp-btn-primary" onClick={() => onSave(toCard, fromCard)}>OK</button>
          <button className="xp-btn" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

// ===== Cycle detection =====
function detectCycles(nodes: Node[], edges: Edge[]): string[][] {
  const adj: Record<string, string[]> = {}
  for (const n of nodes) adj[n.id] = []
  for (const e of edges) {
    if (e.source && e.target) {
      adj[e.source]?.push(e.target)
      adj[e.target]?.push(e.source)
    }
  }
  const visited = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, parent: string | null, path: string[]) {
    visited.add(node)
    path.push(node)
    for (const neighbor of (adj[node] || [])) {
      if (neighbor === parent) continue
      if (path.includes(neighbor)) {
        const cycleStart = path.indexOf(neighbor)
        cycles.push(path.slice(cycleStart).map(id => nodes.find(n => n.id === id)?.data?.name as string || id))
        return
      }
      if (!visited.has(neighbor)) dfs(neighbor, node, [...path])
    }
  }

  for (const n of nodes) if (!visited.has(n.id)) dfs(n.id, null, [])
  return cycles
}

let nId = 1, eId = 1

type EdgeData = { label?: string; cardinality?: string; isGeneralization?: boolean; generalization?: boolean; card?: string; complete?: boolean; exclusive?: boolean; reason?: string }

export default function ERDApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([])
  const [caseIdx, setCaseIdx] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [notation, setNotation] = useState<'old' | 'new'>('old')
  const [connectMode, setConnectMode] = useState<'relation' | 'attribute' | 'generalization' | null>(null)

  // Dialogs
  const [pendingConn, setPendingConn] = useState<{ from: string; to: string } | null>(null)
  const [showGenDialog, setShowGenDialog] = useState(false)
  const [showCardDialog, setShowCardDialog] = useState<{ from: string; to: string } | null>(null)
  const [showCycleDialog, setShowCycleDialog] = useState<string[] | null>(null)

  // Add forms
  const [addType, setAddType] = useState<'entity' | 'relation' | 'attribute'>('entity')
  const [nodeName, setNodeName] = useState('')
  const [isKey, setIsKey] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const currentCase = erdCaseStudies[caseIdx]

  const onConnect = useCallback((connection: Connection) => {
    if (!connectMode) return
    const from = connection.source!
    const to = connection.target!
    if (connectMode === 'generalization') {
      setPendingConn({ from, to })
      setShowGenDialog(true)
    } else if (connectMode === 'relation') {
      setShowCardDialog({ from, to })
    } else {
      // attribute connection - simple line
      setEdges(eds => addEdge({ ...connection, id: `e${eId++}`, style: { strokeWidth: 1, stroke: '#666' } }, eds))
    }
  }, [connectMode, setEdges])

  function saveGenDialog(data: { complete: boolean; exclusive: boolean; reason: string }) {
    if (!pendingConn) return
    const label = `${data.complete ? 'total' : 'partiell'} / ${data.exclusive ? 'disjunkt' : 'überlappend'}`
    setEdges(eds => addEdge({
      source: pendingConn.from, target: pendingConn.to,
      id: `e${eId++}`,
      style: { strokeWidth: 2, strokeDasharray: '5,3', stroke: '#28A745' },
      label: `△ ${label}`,
      data: { ...data, generalization: true },
    }, eds))
    setShowGenDialog(false)
    setPendingConn(null)
    // Check cycles
    const allEdges = [...edges]
    const cycles = detectCycles(nodes, allEdges)
    if (cycles.length > 0) setShowCycleDialog(cycles[0])
  }

  function saveCardDialog(toCard: string, fromCard: string) {
    if (!showCardDialog) return
    const fromNode = nodes.find(n => n.id === showCardDialog.from)
    const toNode = nodes.find(n => n.id === showCardDialog.to)
    // Add two edges (one for each direction) with cardinality labels
    setEdges(eds => [
      ...addEdge({ source: showCardDialog.from, target: showCardDialog.to, id: `e${eId++}`, type: 'cardEdge', data: { card: toCard } }, eds),
    ])
    // Also check for cycles
    setShowCardDialog(null)
    const newEdges = [...edges]
    const cycles = detectCycles(nodes, newEdges)
    if (cycles.length > 0) setShowCycleDialog(cycles[0])
  }

  function addNode() {
    if (!nodeName) return
    const id = `n${nId++}`
    const newNode: Node = {
      id,
      type: addType === 'entity' ? 'entityNode' : addType === 'relation' ? 'relationNode' : 'attributeNode',
      position: { x: 100 + Math.random() * 500, y: 100 + Math.random() * 300 },
      data: addType === 'entity'
        ? { name: nodeName, attributes: [] }
        : addType === 'relation'
        ? { name: nodeName }
        : { name: nodeName, isKey },
    }
    setNodes(nds => [...nds, newNode])
    setNodeName(''); setIsKey(false); setShowAddDialog(false)
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* Left panel */}
      <div style={{ width: 200, borderRight: '1px solid #ACA899', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '6px 8px', background: '#1A4DAA', color: 'white' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>📋 Fallstudie</div>
          <select className="xp-select" value={caseIdx} onChange={e => { setCaseIdx(Number(e.target.value)); setNodes([]); setEdges([]) }} style={{ width: '100%', fontSize: 10 }}>
            {erdCaseStudies.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8, fontSize: 11, lineHeight: 1.6, background: '#F8F7F0' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{currentCase.title}</div>
          <div style={{ textAlign: 'justify' }}>{currentCase.text}</div>
          {currentCase.hint && (
            <div style={{ marginTop: 8, padding: 6, background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 3, fontSize: 10, color: '#856404' }}>
              💡 {currentCase.hint}
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid #ACA899', padding: 8, background: '#ECE9D8' }}>
          <div style={{ marginBottom: 6, fontWeight: 'bold' }}>Notation:</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}>
            <input type="radio" className="xp-radio" name="notation" checked={notation === 'old'} onChange={() => setNotation('old')} />
            Alt: 1 / c / m / mc
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="radio" className="xp-radio" name="notation" checked={notation === 'new'} onChange={() => setNotation('new')} />
            Neu: (min, max)
          </label>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="xp-toolbar">
          <button className="xp-btn" onClick={() => { setAddType('entity'); setShowAddDialog(true) }}>+ Entitätstyp</button>
          <button className="xp-btn" onClick={() => { setAddType('relation'); setShowAddDialog(true) }}>+ Beziehungstyp ⬦</button>
          <button className="xp-btn" onClick={() => { setAddType('attribute'); setShowAddDialog(true) }}>+ Attribut ⬯</button>
          <div className="xp-separator" />
          <button className={`xp-btn${connectMode === 'relation' ? ' xp-btn-primary' : ''}`}
            onClick={() => setConnectMode(m => m === 'relation' ? null : 'relation')}>
            🔗 Beziehung
          </button>
          <button className={`xp-btn${connectMode === 'attribute' ? ' xp-btn-primary' : ''}`}
            onClick={() => setConnectMode(m => m === 'attribute' ? null : 'attribute')}>
            ... Attributlinie
          </button>
          <button className={`xp-btn${connectMode === 'generalization' ? ' xp-btn-primary' : ''}`}
            onClick={() => setConnectMode(m => m === 'generalization' ? null : 'generalization')}>
            △ Generalisierung
          </button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => { setNodes([]); setEdges([]); setSelectedNode(null) }}>↺ Reset</button>
          {connectMode && (
            <span style={{ color: '#1A4DAA', fontWeight: 'bold', marginLeft: 8, fontSize: 10 }}>
              Modus: {connectMode === 'relation' ? '🔗 Beziehung' : connectMode === 'attribute' ? '... Attributlinie' : '△ Generalisierung'}
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            onNodeClick={(_, n) => setSelectedNode(n.id)}
            onPaneClick={() => setSelectedNode(null)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Dialogs */}
      {showAddDialog && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 320 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>⬦</span><span className="xp-window-title">Neues Element</span></div>
            <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                {(['entity', 'relation', 'attribute'] as const).map(t => (
                  <button key={t} className={`xp-btn${addType === t ? ' xp-btn-primary' : ''}`} onClick={() => setAddType(t)}>
                    {t === 'entity' ? '▭ Entität' : t === 'relation' ? '⬦ Beziehung' : '⬯ Attribut'}
                  </button>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Name:</label>
                <input className="xp-input" style={{ width: '100%' }} value={nodeName}
                  onChange={e => setNodeName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && addNode()} />
              </div>
              {addType === 'attribute' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" className="xp-checkbox" checked={isKey} onChange={e => setIsKey(e.target.checked)} />
                  Schlüsselattribut (unterstrichen)
                </label>
              )}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn xp-btn-primary" onClick={addNode}>Hinzufügen</button>
              <button className="xp-btn" onClick={() => setShowAddDialog(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {showGenDialog && (
        <GeneralizationDialog
          onClose={() => { setShowGenDialog(false); setPendingConn(null) }}
          onSave={saveGenDialog}
        />
      )}

      {showCardDialog && (
        <CardDialog
          notation={notation}
          from={nodes.find(n => n.id === showCardDialog.from)?.data?.name as string || '?'}
          to={nodes.find(n => n.id === showCardDialog.to)?.data?.name as string || '?'}
          onClose={() => setShowCardDialog(null)}
          onSave={saveCardDialog}
        />
      )}

      {showCycleDialog && (
        <CycleDialog
          cycle={showCycleDialog}
          onClose={(problematic) => {
            setShowCycleDialog(null)
            if (problematic) {
              alert('Hinweis: Sie haben entschieden, dass der Zyklus problematisch (redundant) ist. Überdenken Sie ggf. eine der Beziehungen.')
            }
          }}
        />
      )}
    </div>
  )
}
