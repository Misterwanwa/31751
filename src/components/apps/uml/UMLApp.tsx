'use client'
import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, MarkerType, Handle, Position,
  NodeProps, EdgeProps, getStraightPath, BaseEdge, EdgeLabelRenderer,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { umlCaseStudies } from '@/lib/case-studies'

// ===== Types =====
interface ClassNodeData {
  name: string
  attributes: { name: string; type: string; visibility: '+' | '-' | '#' }[]
  methods: { name: string; visibility: '+' | '-' | '#'; isGetter?: boolean; isSetter?: boolean }[]
  isAbstract?: boolean
  selected?: boolean
}

// ===== Class Node =====
function ClassNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ClassNodeData
  return (
    <div style={{
      background: 'white',
      border: `2px solid ${selected ? '#316AC5' : '#333'}`,
      borderRadius: 2,
      minWidth: 160,
      fontFamily: 'Courier New, monospace',
      fontSize: 11,
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.6 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.6 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.6 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.6 }} />
      {/* Class name */}
      <div style={{
        background: '#C8D8F7',
        padding: '4px 8px',
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottom: '1px solid #333',
        fontFamily: 'Tahoma, sans-serif',
        fontStyle: d.isAbstract ? 'italic' : 'normal',
      }}>
        {d.isAbstract && <div style={{ fontSize: 9, color: '#666' }}>«abstract»</div>}
        {d.name || '(Name)'}
      </div>
      {/* Attributes */}
      <div style={{ borderBottom: '1px solid #333', padding: '2px 8px', minHeight: 20 }}>
        {d.attributes?.map((a, i) => (
          <div key={i} style={{ whiteSpace: 'nowrap' }}>
            {a.visibility} {a.name}: {a.type}
          </div>
        ))}
      </div>
      {/* Methods */}
      <div style={{ padding: '2px 8px', minHeight: 20 }}>
        {d.methods?.map((m, i) => (
          <div key={i} style={{ whiteSpace: 'nowrap' }}>
            {m.visibility} {m.name}()
          </div>
        ))}
      </div>
    </div>
  )
}

const nodeTypes = { classNode: ClassNode }

// ===== Edge types =====
function AssociationEdge({ id, sourceX, sourceY, targetX, targetY, data, markerEnd, label }: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const d = data as { multiplicity?: string; label?: string; direction?: string } | undefined
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        <div style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          background: 'white',
          border: '1px solid #999',
          borderRadius: 3,
          padding: '1px 5px',
          fontSize: 10,
          pointerEvents: 'none',
          fontFamily: 'Tahoma, sans-serif',
        }}>
          {d?.label || label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

function InheritanceEdge({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd="url(#inheritance-arrow)"
      style={{ strokeWidth: 1.5, stroke: '#333' }}
    />
  )
}

const edgeTypes = {
  association: AssociationEdge,
  inheritance: InheritanceEdge,
}

// ===== Validation =====
function isPascalCase(name: string): boolean {
  return /^[A-ZÄÖÜ][a-zA-ZäöüÄÖÜ0-9]*$/.test(name)
}

function validateMultiplicity(m: string): boolean {
  return /^(\d+|\*)(\.\.(\d+|\*))?$/.test(m)
}

const DATATYPES = ['String', 'Integer', 'Float', 'Decimal', 'Date', 'Boolean', 'Long', 'Double', 'Char']

let nodeIdCounter = 1
let edgeIdCounter = 1

const initCase = umlCaseStudies[0]
const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function UMLApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [caseIdx, setCaseIdx] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState<'association' | 'inheritance' | null>(null)
  const [showAddAttr, setShowAddAttr] = useState(false)
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showEdgeDialog, setShowEdgeDialog] = useState<{ from: string; to: string } | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [validated, setValidated] = useState(false)

  // Form state
  const [className, setClassName] = useState('')
  const [classAbstract, setClassAbstract] = useState(false)
  const [attrName, setAttrName] = useState('')
  const [attrType, setAttrType] = useState('String')
  const [attrVis, setAttrVis] = useState<'+' | '-' | '#'>('-')
  const [addGetSet, setAddGetSet] = useState(true)
  const [methodName, setMethodName] = useState('')
  const [methodVis, setMethodVis] = useState<'+' | '-' | '#'>('+')
  const [assocLabel, setAssocLabel] = useState('')
  const [assocMultFrom, setAssocMultFrom] = useState('1')
  const [assocMultTo, setAssocMultTo] = useState('*')
  const [assocDir, setAssocDir] = useState<'none' | 'forward' | 'backward'>('forward')

  const currentCase = umlCaseStudies[caseIdx]
  const selectedNodeData = nodes.find(n => n.id === selectedNode)?.data as unknown as ClassNodeData | undefined

  const onConnect = useCallback((connection: Connection) => {
    if (!connectMode) return
    if (connectMode === 'inheritance') {
      const id = `e${edgeIdCounter++}`
      setEdges(eds => addEdge({ ...connection, id, type: 'inheritance', animated: false }, eds))
    } else {
      setShowEdgeDialog({ from: connection.source!, to: connection.target! })
    }
  }, [connectMode, setEdges])

  function addEdgeFromDialog() {
    if (!showEdgeDialog) return
    const errs: string[] = []
    if (!validateMultiplicity(assocMultFrom)) errs.push(`Multiplizität "${assocMultFrom}" ungültig (z.B. 1, *, 0..1, 1..*)`)
    if (!validateMultiplicity(assocMultTo)) errs.push(`Multiplizität "${assocMultTo}" ungültig`)
    if (errs.length > 0) { setErrors(errs); return }

    const id = `e${edgeIdCounter++}`
    setEdges(eds => addEdge({
      source: showEdgeDialog.from,
      target: showEdgeDialog.to,
      id,
      type: 'association',
      markerEnd: assocDir === 'forward' ? { type: MarkerType.ArrowClosed } : undefined,
      markerStart: assocDir === 'backward' ? { type: MarkerType.ArrowClosed } : undefined,
      label: `[${assocMultFrom}..${assocMultTo}] ${assocLabel}`,
      data: { label: `${assocLabel || ''}  ${assocMultFrom}..${assocMultTo}`, multiplicity: `${assocMultFrom}..${assocMultTo}`, direction: assocDir },
    }, eds))
    setShowEdgeDialog(null)
    setAssocLabel(''); setAssocMultFrom('1'); setAssocMultTo('*')
  }

  function addClass() {
    const errs: string[] = []
    if (!className) { errs.push('Klassenname darf nicht leer sein.'); setErrors(errs); return }
    if (!isPascalCase(className)) errs.push(`"${className}" ist kein gültiger Klassenname (PascalCase: erster Buchstabe groß, keine Leerzeichen)`)
    if (errs.length > 0) { setErrors(errs); return }

    const id = `n${nodeIdCounter++}`
    const newNode: Node = {
      id,
      type: 'classNode',
      position: { x: 80 + Math.random() * 400, y: 80 + Math.random() * 300 },
      data: { name: className, attributes: [], methods: [], isAbstract: classAbstract } as unknown as Record<string, unknown>,
    }
    setNodes(nds => [...nds, newNode])
    setClassName(''); setClassAbstract(false); setShowAddClass(false); setErrors([])
    setSelectedNode(id)
  }

  function addAttribute() {
    if (!selectedNode) return
    const errs: string[] = []
    if (!attrName) { errs.push('Attributname fehlt.'); setErrors(errs); return }
    setErrors([])
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode) return n
      const d = n.data as unknown as ClassNodeData
      const newAttrs = [...(d.attributes || []), { name: attrName, type: attrType, visibility: attrVis }]
      const newMethods = [...(d.methods || [])]
      if (addGetSet) {
        const capName = attrName.charAt(0).toUpperCase() + attrName.slice(1)
        newMethods.push({ name: `get${capName}`, visibility: '+' as const, isGetter: true })
        newMethods.push({ name: `set${capName}`, visibility: '+' as const, isSetter: true })
      }
      return { ...n, data: { ...n.data, attributes: newAttrs, methods: newMethods } as unknown as Record<string, unknown> }
    }))
    setAttrName(''); setShowAddAttr(false)
  }

  function addMethod() {
    if (!selectedNode) return
    const errs: string[] = []
    if (!methodName) { errs.push('Methodenname fehlt.'); setErrors(errs); return }
    setErrors([])
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNode) return n
      const d = n.data as unknown as ClassNodeData
      return { ...n, data: { ...n.data, methods: [...(d.methods || []), { name: methodName, visibility: methodVis }] } as unknown as Record<string, unknown> }
    }))
    setMethodName(''); setShowAddMethod(false)
  }

  function validate() {
    const errs: string[] = []
    for (const n of nodes) {
      const d = n.data as unknown as ClassNodeData
      if (!isPascalCase(d.name)) errs.push(`Klasse "${d.name}": Name muss PascalCase sein`)
      if (!d.attributes || d.attributes.length === 0) errs.push(`Klasse "${d.name}": Hat keine Attribute`)
    }
    if (nodes.length === 0) errs.push('Keine Klassen vorhanden.')
    setErrors(errs)
    setValidated(true)
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* SVG defs for inheritance arrow */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker id="inheritance-arrow" viewBox="0 0 20 20" refX="10" refY="10" markerWidth="10" markerHeight="10" orient="auto">
            <polygon points="0,0 20,10 0,20" fill="white" stroke="#333" strokeWidth="1.5" />
          </marker>
        </defs>
      </svg>

      {/* Left sidebar: case study */}
      <div style={{
        width: 220, borderRight: '1px solid #ACA899', display: 'flex',
        flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Case selector */}
        <div style={{ padding: '6px 8px', background: '#1A4DAA', color: 'white' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>📋 Fallbeschreibung</div>
          <select
            className="xp-select"
            value={caseIdx}
            onChange={e => { setCaseIdx(Number(e.target.value)); setNodes([]); setEdges([]) }}
            style={{ width: '100%', fontSize: 10 }}
          >
            {umlCaseStudies.map((c, i) => (
              <option key={i} value={i}>{c.title}</option>
            ))}
          </select>
        </div>
        {/* Case text */}
        <div style={{ flex: 1, overflow: 'auto', padding: 8, fontSize: 11, lineHeight: 1.6, color: '#333', background: '#F8F7F0' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{currentCase.title}</div>
          <div style={{ textAlign: 'justify' }}>{currentCase.text}</div>
          {currentCase.hint && (
            <div style={{
              marginTop: 10, padding: 8,
              background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 3,
              fontSize: 10, color: '#856404',
            }}>
              <strong>💡 Hinweis:</strong> {currentCase.hint}
            </div>
          )}
        </div>
        {/* Validation panel */}
        <div style={{ borderTop: '1px solid #ACA899', padding: 8, background: '#ECE9D8' }}>
          <button className="xp-btn xp-btn-primary" onClick={validate} style={{ width: '100%', marginBottom: 6 }}>
            ✅ Diagramm prüfen
          </button>
          {validated && errors.length === 0 && (
            <div style={{ color: '#28A745', fontSize: 10, fontWeight: 'bold' }}>✅ Diagramm ist korrekt!</div>
          )}
          {errors.map((e, i) => (
            <div key={i} style={{ color: '#DC3545', fontSize: 10, marginTop: 2 }}>⚠️ {e}</div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="xp-toolbar">
          <button className="xp-btn" onClick={() => setShowAddClass(true)}>+ Klasse</button>
          <div className="xp-separator" />
          <button
            className={`xp-btn${selectedNode && showAddAttr ? '' : ''}`}
            onClick={() => { if (selectedNode) setShowAddAttr(true) }}
            disabled={!selectedNode}
            style={{ opacity: selectedNode ? 1 : 0.5 }}
          >+ Attribut</button>
          <button
            className="xp-btn"
            onClick={() => { if (selectedNode) setShowAddMethod(true) }}
            disabled={!selectedNode}
            style={{ opacity: selectedNode ? 1 : 0.5 }}
          >+ Methode</button>
          <div className="xp-separator" />
          <button
            className={`xp-btn${connectMode === 'association' ? ' xp-btn-primary' : ''}`}
            onClick={() => setConnectMode(m => m === 'association' ? null : 'association')}
            title="Assoziationspfeil zeichnen"
          >🔗 Assoziation</button>
          <button
            className={`xp-btn${connectMode === 'inheritance' ? ' xp-btn-primary' : ''}`}
            onClick={() => setConnectMode(m => m === 'inheritance' ? null : 'inheritance')}
            title="Vererbungspfeil zeichnen"
          >△ Generalisierung</button>
          <div className="xp-separator" />
          <button
            className="xp-btn"
            onClick={() => {
              if (selectedNode) {
                setNodes(nds => nds.filter(n => n.id !== selectedNode))
                setEdges(eds => eds.filter(e => e.source !== selectedNode && e.target !== selectedNode))
                setSelectedNode(null)
              }
            }}
            disabled={!selectedNode}
            style={{ opacity: selectedNode ? 1 : 0.5 }}
          >🗑️ Löschen</button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => { setNodes([]); setEdges([]); setSelectedNode(null); setErrors([]) }}>
            ↺ Reset
          </button>
          {connectMode && (
            <span style={{ color: '#1A4DAA', fontWeight: 'bold', marginLeft: 8, fontSize: 10 }}>
              {connectMode === 'association' ? '🔗 Assoziationsmodus: Verbinde zwei Klassen' : '△ Vererbungsmodus: Unterklasse → Oberklasse'}
            </span>
          )}
        </div>

        {/* React Flow canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(_, n) => setSelectedNode(n.id)}
            onPaneClick={() => setSelectedNode(null)}
            connectOnClick={!!connectMode}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Dialogs */}
      {showAddClass && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 320 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>📦</span><span className="xp-window-title">Neue Klasse</span></div>
            <div className="xp-dialog-body">
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', marginBottom: 3 }}>Klassenname (PascalCase):</label>
                <input className="xp-input" style={{ width: '100%' }} value={className} onChange={e => setClassName(e.target.value)}
                  placeholder="z.B. Kunde, Bestellung" onKeyDown={e => e.key === 'Enter' && addClass()} autoFocus />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" className="xp-checkbox" checked={classAbstract} onChange={e => setClassAbstract(e.target.checked)} />
                Abstrakte Klasse
              </label>
              {errors.map((e, i) => <div key={i} style={{ color: '#DC3545', fontSize: 10, marginTop: 6 }}>⚠️ {e}</div>)}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn xp-btn-primary" onClick={addClass}>Hinzufügen</button>
              <button className="xp-btn" onClick={() => { setShowAddClass(false); setErrors([]) }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {showAddAttr && selectedNode && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 360 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>📌</span><span className="xp-window-title">Attribut hinzufügen – {selectedNodeData?.name}</span></div>
            <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 3 }}>Name:</label>
                  <input className="xp-input" style={{ width: '100%' }} value={attrName}
                    onChange={e => setAttrName(e.target.value)} placeholder="z.B. name, alter" autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 3 }}>Typ:</label>
                  <select className="xp-select" value={attrType} onChange={e => setAttrType(e.target.value)}>
                    {DATATYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Sichtbarkeit:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['+', '-', '#'] as const).map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" className="xp-radio" value={v} checked={attrVis === v} onChange={() => setAttrVis(v)} />
                      {v === '+' ? '+ public' : v === '-' ? '- private' : '# protected'}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" className="xp-checkbox" checked={addGetSet} onChange={e => setAddGetSet(e.target.checked)} />
                Getter/Setter automatisch hinzufügen
              </label>
              {errors.map((e, i) => <div key={i} style={{ color: '#DC3545', fontSize: 10 }}>⚠️ {e}</div>)}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn xp-btn-primary" onClick={addAttribute}>Hinzufügen</button>
              <button className="xp-btn" onClick={() => { setShowAddAttr(false); setErrors([]) }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {showAddMethod && selectedNode && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 320 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>⚙️</span><span className="xp-window-title">Methode hinzufügen – {selectedNodeData?.name}</span></div>
            <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Methodenname:</label>
                <input className="xp-input" style={{ width: '100%' }} value={methodName}
                  onChange={e => setMethodName(e.target.value)} placeholder="z.B. berechneGesamtpreis" autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Sichtbarkeit:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['+', '-', '#'] as const).map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" className="xp-radio" value={v} checked={methodVis === v} onChange={() => setMethodVis(v)} />
                      {v === '+' ? '+ public' : v === '-' ? '- private' : '# protected'}
                    </label>
                  ))}
                </div>
              </div>
              {errors.map((e, i) => <div key={i} style={{ color: '#DC3545', fontSize: 10 }}>⚠️ {e}</div>)}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn xp-btn-primary" onClick={addMethod}>Hinzufügen</button>
              <button className="xp-btn" onClick={() => { setShowAddMethod(false); setErrors([]) }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {showEdgeDialog && (
        <div className="xp-dialog-overlay">
          <div className="xp-dialog" style={{ width: 380 }}>
            <div className="xp-window-titlebar"><span style={{ fontSize: 14 }}>🔗</span><span className="xp-window-title">Assoziation konfigurieren</span></div>
            <div className="xp-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Bezeichner (optional):</label>
                <input className="xp-input" style={{ width: '100%' }} value={assocLabel}
                  onChange={e => setAssocLabel(e.target.value)} placeholder="z.B. hat, besitzt, arbeitet_für" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 3 }}>Multiplizität (Quelle):</label>
                  <input className="xp-input" style={{ width: '100%' }} value={assocMultFrom}
                    onChange={e => setAssocMultFrom(e.target.value)} placeholder="1, *, 0..1, 1..*" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 3 }}>Multiplizität (Ziel):</label>
                  <input className="xp-input" style={{ width: '100%' }} value={assocMultTo}
                    onChange={e => setAssocMultTo(e.target.value)} placeholder="1, *, 0..1, 1..*" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 3 }}>Leserichtung:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['none', 'forward', 'backward'] as const).map(d => (
                    <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" className="xp-radio" value={d} checked={assocDir === d} onChange={() => setAssocDir(d)} />
                      {d === 'none' ? 'Keine' : d === 'forward' ? '→ Vorwärts' : '← Rückwärts'}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ background: '#F0EFE6', padding: 6, borderRadius: 3, fontSize: 10, color: '#555' }}>
                Multiplizitäten: 1, *, 0..1, 1..*, 0..*, m..n (z.B. 2..5)
              </div>
              {errors.map((e, i) => <div key={i} style={{ color: '#DC3545', fontSize: 10 }}>⚠️ {e}</div>)}
            </div>
            <div className="xp-dialog-footer">
              <button className="xp-btn xp-btn-primary" onClick={addEdgeFromDialog}>OK</button>
              <button className="xp-btn" onClick={() => { setShowEdgeDialog(null); setErrors([]) }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
