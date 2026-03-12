'use client'
import { useState, useCallback } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, Handle, Position, NodeProps, EdgeProps,
  getStraightPath, BaseEdge, EdgeLabelRenderer, MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { bpmnCaseStudies } from '@/lib/case-studies'

// ===== Node types =====
function StartEventNode({ selected }: NodeProps) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#D4EDDA', border: `3px solid ${selected ? '#316AC5' : '#28A745'}`, position: 'relative' }}>
      <Handle type="source" position={Position.Right} style={{ opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▶</div>
    </div>
  )
}

function EndEventNode({ selected }: NodeProps) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F8D7DA', border: `4px solid ${selected ? '#316AC5' : '#DC3545'}`, position: 'relative' }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>■</div>
    </div>
  )
}

function TaskNode({ data, selected }: NodeProps) {
  const d = data as { label: string; role: string; app: string; info: string }
  return (
    <div style={{
      background: '#EEF4FF', border: `2px solid ${selected ? '#316AC5' : '#7A96DF'}`,
      borderRadius: 6, padding: '6px 10px', minWidth: 140, maxWidth: 200,
      fontFamily: 'Tahoma, sans-serif', fontSize: 11,
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.15)',
    }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0.7 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.7 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <div style={{ fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>{d.label}</div>
      {d.role && <div style={{ fontSize: 9, color: '#1A4DAA', background: '#D8E8FF', padding: '1px 4px', borderRadius: 2, marginBottom: 2 }}>👤 {d.role}</div>}
      {d.app && <div style={{ fontSize: 9, color: '#333', background: '#F0F0E8', padding: '1px 4px', borderRadius: 2, marginBottom: 2 }}>🖥️ {d.app}</div>}
      {d.info && <div style={{ fontSize: 9, color: '#666', fontStyle: 'italic' }}>{d.info}</div>}
    </div>
  )
}

function XORGatewayNode({ data, selected }: NodeProps) {
  const d = data as { label: string; type: 'XOR' | 'AND' | 'OR' }
  const colors = { XOR: '#FFF3CD', AND: '#D4EDDA', OR: '#EEF4FF' }
  const strokes = { XOR: '#FFC107', AND: '#28A745', OR: '#316AC5' }
  const symbols = { XOR: '✕', AND: '+', OR: '○' }
  const type = d.type || 'XOR'
  return (
    <div style={{ width: 50, height: 50, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0.7 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.7 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon
          points="25,2 48,25 25,48 2,25"
          fill={colors[type]}
          stroke={selected ? '#316AC5' : strokes[type]}
          strokeWidth={2}
        />
      </svg>
      <span style={{ position: 'relative', zIndex: 1, fontSize: 18, fontWeight: 'bold', color: strokes[type] }}>
        {symbols[type]}
      </span>
      <div style={{
        position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: '#666', whiteSpace: 'nowrap', fontFamily: 'Tahoma, sans-serif',
      }}>
        {type}-Gateway
      </div>
    </div>
  )
}

function LaneNode({ data, selected }: NodeProps) {
  const d = data as { label: string; role: string }
  return (
    <div style={{
      width: 800, height: 120,
      background: selected ? '#F0F4FF' : '#FAFAF5',
      border: `2px solid ${selected ? '#316AC5' : '#ACA899'}`,
      borderRadius: 4,
    }}>
      <Handle type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div style={{
        width: 40, height: '100%', background: selected ? '#C8D8F7' : '#DDD9C8',
        borderRight: '2px solid #ACA899', display: 'flex', alignItems: 'center', justifyContent: 'center',
        float: 'left',
      }}>
        <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, fontWeight: 'bold', writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
          {d.role || d.label}
        </span>
      </div>
    </div>
  )
}

const nodeTypes = {
  startEvent: StartEventNode,
  endEvent: EndEventNode,
  task: TaskNode,
  xorGateway: XORGatewayNode,
  lane: LaneNode,
}

function SequenceEdge({ id, sourceX, sourceY, targetX, targetY, data, label }: EdgeProps) {
  const [path, lx, ly] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const d = data as { condition?: string } | undefined
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={`url(#seq-arrow)`} style={{ strokeWidth: 1.5, stroke: '#333' }} />
      {(d?.condition || label) && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${lx}px,${ly}px)`,
            background: '#FFF9E7', border: '1px solid #FFC107', borderRadius: 3,
            padding: '1px 5px', fontSize: 9, pointerEvents: 'none', fontFamily: 'Tahoma, sans-serif',
            color: '#856404', fontStyle: 'italic',
          }}>
            [{d?.condition || label as string}]
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const edgeTypes = { sequenceEdge: SequenceEdge }

// ===== Validation =====
function validateProcess(nodes: Node[], edges: Edge[]): string[] {
  const errors: string[] = []
  const gateways = nodes.filter(n => n.type === 'xorGateway')

  for (const gw of gateways) {
    const incoming = edges.filter(e => e.target === gw.id).length
    const outgoing = edges.filter(e => e.source === gw.id).length
    const d = gw.data as { type: string; label: string }
    const type = d.type || 'XOR'

    if (incoming === 1 && outgoing > 1) {
      // Opening gateway - check if outgoing edges have conditions
      if (type === 'XOR' || type === 'OR') {
        const edges2 = edges.filter(e => e.source === gw.id)
        const withoutCondition = edges2.filter(e => !e.data?.condition && !e.label)
        if (withoutCondition.length > 0) {
          errors.push(`${type}-Gateway "${d.label || gw.id}": Alle ausgehenden Kanten müssen Bedingungen haben`)
        }
      }
    } else if (incoming > 1 && outgoing === 1) {
      // Closing gateway - OK
    } else if (incoming === 1 && outgoing === 1) {
      errors.push(`Gateway "${d.label || gw.id}": Hat nur 1 ein- und 1 ausgehende Kante (sinnlos)`)
    } else if (incoming === 0 || outgoing === 0) {
      errors.push(`Gateway "${d.label || gw.id}": Nicht verbunden`)
    }
  }

  const starts = nodes.filter(n => n.type === 'startEvent')
  const ends = nodes.filter(n => n.type === 'endEvent')
  if (starts.length === 0) errors.push('Kein Startereignis vorhanden')
  if (ends.length === 0) errors.push('Kein Endereignis vorhanden')

  return errors
}

let nId = 1, eId = 1

// ===== Edge condition dialog =====
function EdgeConditionDialog({ onSave, onClose }: { onSave: (cond: string) => void; onClose: () => void }) {
  const [cond, setCond] = useState('')
  return (
    <div className="xp-dialog-overlay">
      <div className="xp-dialog" style={{ width: 320 }}>
        <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>📋</span><span className="xp-window-title">Bedingung für Pfeil</span></div>
        <div className="xp-dialog-body">
          <label style={{ display: 'block', marginBottom: 3 }}>Bedingung (für XOR/OR-Kanten):</label>
          <input className="xp-input" style={{ width: '100%' }} value={cond} onChange={e => setCond(e.target.value)}
            placeholder="z.B. Bestellung vollständig, sonst" autoFocus onKeyDown={e => e.key === 'Enter' && onSave(cond)} />
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Leer lassen für Kanten ohne Bedingung</div>
        </div>
        <div className="xp-dialog-footer">
          <button className="xp-btn xp-btn-primary" onClick={() => onSave(cond)}>OK</button>
          <button className="xp-btn" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

// ===== Task config dialog =====
function TaskConfigDialog({ onSave, onClose }: { onSave: (d: { label: string; role: string; app: string; info: string }) => void; onClose: () => void }) {
  const [label, setLabel] = useState('')
  const [role, setRole] = useState('')
  const [app, setApp] = useState('')
  const [info, setInfo] = useState('')
  const roles = ['', 'Vertrieb', 'Einkauf', 'Personalwesen', 'Fachabteilung', 'Management', 'Lager', 'Kunde', 'Verwaltung', 'Dozent', 'IT', 'Buchhaltung']
  return (
    <div className="xp-dialog-overlay">
      <div className="xp-dialog" style={{ width: 360 }}>
        <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>📦</span><span className="xp-window-title">Aufgabe / GPS konfigurieren</span></div>
        <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 3 }}>Bezeichnung (GPS-Schritt):</label>
            <input className="xp-input" style={{ width: '100%' }} value={label} onChange={e => setLabel(e.target.value)}
              placeholder="z.B. Bestellung prüfen" autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 3 }}>Abteilung / Rolle:</label>
            <select className="xp-select" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
              {roles.map(r => <option key={r} value={r}>{r || '(keine)'}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 3 }}>Verwendete Applikation / Modul:</label>
            <input className="xp-input" style={{ width: '100%' }} value={app} onChange={e => setApp(e.target.value)}
              placeholder="z.B. ERP-System, MS-Outlook" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 3 }}>Zusatzinfo (optional):</label>
            <input className="xp-input" style={{ width: '100%' }} value={info} onChange={e => setInfo(e.target.value)} />
          </div>
        </div>
        <div className="xp-dialog-footer">
          <button className="xp-btn xp-btn-primary" onClick={() => onSave({ label, role, app, info })}>Hinzufügen</button>
          <button className="xp-btn" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

type EdgeData = { condition: string }

export default function BPMNApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([])
  const [caseIdx, setCaseIdx] = useState(0)
  const [pendingConn, setPendingConn] = useState<Connection | null>(null)
  const [showEdgeDialog, setShowEdgeDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showGatewayType, setShowGatewayType] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [validated, setValidated] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const currentCase = bpmnCaseStudies[caseIdx]

  const onConnect = useCallback((connection: Connection) => {
    setPendingConn(connection)
    setShowEdgeDialog(true)
  }, [])

  function saveEdge(cond: string) {
    if (!pendingConn) return
    setEdges(eds => addEdge({
      ...pendingConn,
      id: `e${eId++}`,
      type: 'sequenceEdge',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { condition: cond },
      label: cond,
    }, eds))
    setPendingConn(null)
    setShowEdgeDialog(false)
  }

  function addElement(type: 'startEvent' | 'endEvent' | 'xorGateway' | 'lane') {
    let gwType = type
    const id = `n${nId++}`
    const newNode: Node = {
      id,
      type,
      position: { x: 100 + Math.random() * 500, y: 100 + Math.random() * 200 },
      data: type === 'lane'
        ? { label: 'Swimlane', role: 'Abteilung' }
        : type === 'xorGateway'
        ? { label: '', type: 'XOR' }
        : {},
    }
    if (type === 'lane') newNode.style = { width: 800, height: 120, zIndex: -1 }
    setNodes(nds => [...nds, newNode])
  }

  function addTask(data: { label: string; role: string; app: string; info: string }) {
    const id = `n${nId++}`
    setNodes(nds => [...nds, {
      id, type: 'task',
      position: { x: 100 + Math.random() * 500, y: 100 + Math.random() * 200 },
      data,
    }])
    setShowTaskDialog(false)
  }

  function addGateway(type: 'XOR' | 'AND' | 'OR') {
    const id = `n${nId++}`
    setNodes(nds => [...nds, {
      id, type: 'xorGateway',
      position: { x: 200 + Math.random() * 400, y: 150 + Math.random() * 200 },
      data: { label: `${type}`, type },
    }])
    setShowGatewayType(false)
  }

  function validate() {
    const errs = validateProcess(nodes, edges)
    setErrors(errs)
    setValidated(true)
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* SVG defs */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker id="seq-arrow" viewBox="0 0 20 20" refX="18" refY="10" markerWidth="10" markerHeight="10" orient="auto">
            <polygon points="0,0 20,10 0,20" fill="#333" />
          </marker>
        </defs>
      </svg>

      {/* Left panel */}
      <div style={{ width: 200, borderRight: '1px solid #ACA899', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '6px 8px', background: '#1A4DAA', color: 'white' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>📋 Ist-Analyse</div>
          <select className="xp-select" value={caseIdx} onChange={e => { setCaseIdx(Number(e.target.value)); setNodes([]); setEdges([]) }} style={{ width: '100%', fontSize: 10 }}>
            {bpmnCaseStudies.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
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
          <button className="xp-btn xp-btn-primary" onClick={validate} style={{ width: '100%', marginBottom: 6 }}>
            ✅ Prozess prüfen
          </button>
          {validated && errors.length === 0 && (
            <div style={{ color: '#28A745', fontSize: 10, fontWeight: 'bold' }}>✅ Prozessmodell ist korrekt!</div>
          )}
          {errors.map((e, i) => <div key={i} style={{ color: '#DC3545', fontSize: 10, marginTop: 2 }}>⚠️ {e}</div>)}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="xp-toolbar">
          <button className="xp-btn" onClick={() => addElement('startEvent')} title="Startereignis">● Start</button>
          <button className="xp-btn" onClick={() => addElement('endEvent')} title="Endereignis">■ Ende</button>
          <button className="xp-btn" onClick={() => setShowTaskDialog(true)}>📦 GPS / Aufgabe</button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => setShowGatewayType(true)}>⬦ Gateway</button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => addElement('lane')}>≡ Swimlane</button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => {
            if (selectedNode) {
              setNodes(nds => nds.filter(n => n.id !== selectedNode))
              setEdges(eds => eds.filter(e => e.source !== selectedNode && e.target !== selectedNode))
              setSelectedNode(null)
            }
          }} disabled={!selectedNode} style={{ opacity: selectedNode ? 1 : 0.5 }}>🗑️ Löschen</button>
          <button className="xp-btn" onClick={() => { setNodes([]); setEdges([]); setErrors([]) }}>↺ Reset</button>
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
      {showEdgeDialog && (
        <EdgeConditionDialog onSave={saveEdge} onClose={() => { setShowEdgeDialog(false); setPendingConn(null) }} />
      )}
      {showTaskDialog && (
        <TaskConfigDialog onSave={addTask} onClose={() => setShowTaskDialog(false)} />
      )}
      {showGatewayType && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 300 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>⬦</span><span className="xp-window-title">Gateway-Typ wählen</span></div>
            <div className="xp-dialog-body" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {(['XOR', 'AND', 'OR'] as const).map(t => (
                <button key={t} className="xp-btn" onClick={() => addGateway(t)} style={{ padding: '16px 20px', fontSize: 14, fontWeight: 'bold' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{t === 'XOR' ? '✕' : t === 'AND' ? '+' : '○'}</div>
                  <div style={{ fontSize: 11 }}>{t}-Gateway</div>
                </button>
              ))}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn" onClick={() => setShowGatewayType(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
