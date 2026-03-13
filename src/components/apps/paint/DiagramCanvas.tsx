'use client'
import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, Handle, Position, NodeProps, EdgeProps,
  getStraightPath, BaseEdge, EdgeLabelRenderer, MarkerType,
  ReactFlowProvider, useReactFlow,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ===== Types =====
type DiagramNodeType = 
  | 'umlClass' | 'entity' | 'relation' | 'attribute' 
  | 'gpsBox' | 'logicOperator' | 'startEnd' | 'textNode'

type LogicType = 'OR' | 'AND' | 'XOR'
type EdgeLabelPosition = 'source' | 'target' | 'center'

interface DiagramNodeData {
  label?: string
  attributes?: string[]
  operations?: string[]
  isKey?: boolean
  logicType?: LogicType
  gpsId?: string
  gpsApp?: string
  gpsModule?: string
  cardinality?: string
  sourceCard?: string
  targetCard?: string
}

// ===== UML Class Node (dreigeteiltes Rechteck) =====
function UMLClassNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [isEditing, setIsEditing] = useState(false)
  const [editField, setEditField] = useState<'name' | 'attributes' | 'operations' | null>(null)
  const [editValue, setEditValue] = useState('')

  const d = data || {}
  const [name, setName] = useState(d.label || 'ClassName')
  const [attributes, setAttributes] = useState<string[]>(d.attributes || ['- attribute: Type'])
  const [operations, setOperations] = useState<string[]>(d.operations || ['+ operation(): ReturnType'])

  const startEdit = (field: 'name' | 'attributes' | 'operations') => {
    setEditField(field)
    setIsEditing(true)
    if (field === 'name') setEditValue(name)
    else if (field === 'attributes') setEditValue(attributes.join('\n'))
    else setEditValue(operations.join('\n'))
  }

  const saveEdit = () => {
    if (editField === 'name') setName(editValue)
    else if (editField === 'attributes') setAttributes(editValue.split('\n').filter(s => s.trim()))
    else setOperations(editValue.split('\n').filter(s => s.trim()))
    setIsEditing(false)
  }

  return (
    <div style={{
      background: selected ? '#EEF4FF' : 'white',
      border: `2px solid ${selected ? '#316AC5' : '#333'}`,
      minWidth: 140,
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 11,
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      
      {/* Klassenname */}
      <div 
        onDoubleClick={() => startEdit('name')}
        style={{
          padding: '6px 10px',
          borderBottom: '1px solid #333',
          textAlign: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {isEditing && editField === 'name' ? (
          <input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
            autoFocus
            style={{ width: '100%', fontSize: 11 }}
          />
        ) : name}
      </div>
      
      {/* Attribute */}
      <div 
        onDoubleClick={() => startEdit('attributes')}
        style={{
          padding: '4px 8px',
          borderBottom: '1px solid #333',
          minHeight: 24,
          cursor: 'pointer',
        }}
      >
        {isEditing && editField === 'attributes' ? (
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            autoFocus
            style={{ width: '100%', fontSize: 10, resize: 'none' }}
            rows={3}
          />
        ) : (
          attributes.map((a, i) => <div key={i} style={{ fontSize: 10 }}>{a}</div>)
        )}
      </div>
      
      {/* Operationen */}
      <div 
        onDoubleClick={() => startEdit('operations')}
        style={{
          padding: '4px 8px',
          minHeight: 24,
          cursor: 'pointer',
        }}
      >
        {isEditing && editField === 'operations' ? (
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            autoFocus
            style={{ width: '100%', fontSize: 10, resize: 'none' }}
            rows={3}
          />
        ) : (
          operations.map((o, i) => <div key={i} style={{ fontSize: 10 }}>{o}</div>)
        )}
      </div>
    </div>
  )
}

// ===== Entity Node (Rechteck für ERM) =====
function EntityNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [name, setName] = useState(data?.label || 'Entity')
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div style={{
      background: selected ? '#EEF4FF' : 'white',
      border: `2px solid ${selected ? '#316AC5' : '#333'}`,
      padding: '8px 16px',
      minWidth: 100,
      textAlign: 'center',
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      
      {isEditing ? (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          style={{ width: '100%', textAlign: 'center', fontSize: 11 }}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>{name}</span>
      )}
    </div>
  )
}

// ===== Relation Node (Raute für ERM) =====
function RelationNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [name, setName] = useState(data?.label || 'Relation')
  const [isEditing, setIsEditing] = useState(false)

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
      
      {isEditing ? (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          style={{
            position: 'relative', zIndex: 1,
            width: 70, textAlign: 'center', fontSize: 10,
            border: 'none', background: 'transparent'
          }}
        />
      ) : (
        <span 
          onDoubleClick={() => setIsEditing(true)} 
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', cursor: 'pointer' }}
        >
          {name}
        </span>
      )}
    </div>
  )
}

// ===== Attribute Node (Ellipse für ERM) =====
function AttributeNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [name, setName] = useState(data?.label || 'Attribute')
  const [isEditing, setIsEditing] = useState(false)
  const isKey = data?.isKey || false

  return (
    <div style={{
      background: isKey ? '#FFF9E7' : 'white',
      border: `2px solid ${selected ? '#316AC5' : isKey ? '#FFC107' : '#888'}`,
      borderRadius: '50%',
      padding: '6px 12px',
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 10,
      textDecoration: isKey ? 'underline' : 'none',
      minWidth: 80,
      textAlign: 'center',
      boxShadow: selected ? '0 0 0 2px #316AC599' : '1px 1px 3px rgba(0,0,0,0.1)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      
      {isEditing ? (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          style={{ width: '100%', textAlign: 'center', fontSize: 10, border: 'none', background: 'transparent' }}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
          {isKey && <span>🔑 </span>}{name}
        </span>
      )}
    </div>
  )
}

// ===== GPS Box Node (Geschäftsprozessschritt) =====
function GPSBoxNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [gpsId, setGpsId] = useState(data?.gpsId || '1.0')
  const [label, setLabel] = useState(data?.label || 'GPS Name')
  const [app, setApp] = useState(data?.gpsApp || 'App')
  const [module, setModule] = useState(data?.gpsModule || 'Modul')
  const [editing, setEditing] = useState<string | null>(null)

  const renderField = (value: string, setValue: (v: string) => void, field: string, style: React.CSSProperties = {}) => {
    if (editing === field) {
      return (
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={() => setEditing(null)}
          onKeyDown={e => e.key === 'Enter' && setEditing(null)}
          autoFocus
          style={{ width: '100%', fontSize: 10, border: 'none', background: 'transparent', ...style }}
        />
      )
    }
    return (
      <div onDoubleClick={() => setEditing(field)} style={{ cursor: 'pointer', ...style }}>
        {value}
      </div>
    )
  }

  return (
    <div style={{
      background: selected ? '#EEF4FF' : 'white',
      border: `2px solid ${selected ? '#316AC5' : '#333'}`,
      borderRadius: 8,
      width: 160,
      height: 80,
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 10,
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '20px 1fr 20px',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      
      {/* Top Left: ID */}
      <div style={{
        gridColumn: '1', gridRow: '1',
        borderRight: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
        padding: '2px 4px',
        background: '#f5f5f5',
        fontWeight: 'bold',
      }}>
        {renderField(gpsId, setGpsId, 'id', { fontWeight: 'bold' })}
      </div>
      
      {/* Top Right: empty */}
      <div style={{ gridColumn: '2', gridRow: '1', borderBottom: '1px solid #ccc' }} />
      
      {/* Center: Name */}
      <div style={{
        gridColumn: '1 / 3', gridRow: '2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid #ccc',
        fontSize: 11, fontWeight: 'bold',
        padding: '4px',
      }}>
        {renderField(label, setLabel, 'label', { fontWeight: 'bold', textAlign: 'center' })}
      </div>
      
      {/* Bottom Left: App */}
      <div style={{
        gridColumn: '1', gridRow: '3',
        borderRight: '1px solid #ccc',
        padding: '2px 4px',
        background: '#f5f5f5',
        fontSize: 9,
      }}>
        {renderField(app, setApp, 'app', { fontSize: 9 })}
      </div>
      
      {/* Bottom Right: Module */}
      <div style={{
        gridColumn: '2', gridRow: '3',
        padding: '2px 4px',
        background: '#f5f5f5',
        fontSize: 9,
      }}>
        {renderField(module, setModule, 'module', { fontSize: 9 })}
      </div>
    </div>
  )
}

// ===== Logic Operator Node (UND/ODER/XOR) =====
function LogicOperatorNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const type = data?.logicType || 'OR'
  const symbols: Record<LogicType, string> = { OR: '∨', AND: '∧', XOR: '⊻' }
  const colors: Record<LogicType, string> = { OR: '#FFC107', AND: '#28A745', XOR: '#DC3545' }

  return (
    <div style={{
      width: 50, height: 50,
      borderRadius: '50%',
      background: 'white',
      border: `3px solid ${selected ? '#316AC5' : colors[type]}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 'bold',
      color: colors[type],
      boxShadow: selected ? '0 0 0 2px #316AC599' : '2px 2px 4px rgba(0,0,0,0.2)',
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0.5 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.5 }} />
      {symbols[type]}
    </div>
  )
}

// ===== Start/End Node (Fünfeck/Pfeilform) =====
function StartEndNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [name, setName] = useState(data?.label || 'Start')
  const [isEditing, setIsEditing] = useState(false)
  const isStart = name.toLowerCase().includes('start')

  return (
    <div style={{
      width: 60, height: 50,
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Handle type={isStart ? 'source' : 'target'} position={isStart ? Position.Right : Position.Left} style={{ opacity: 0.5 }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <polygon
          points={isStart ? "10,25 40,5 50,5 50,45 40,45" : "10,5 40,5 50,25 40,45 10,45"}
          fill={isStart ? '#D4EDDA' : '#F8D7DA'}
          stroke={selected ? '#316AC5' : isStart ? '#28A745' : '#DC3545'}
          strokeWidth={2}
        />
      </svg>
      
      {isEditing ? (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          style={{
            position: 'relative', zIndex: 1,
            width: 50, textAlign: 'center', fontSize: 9,
            border: 'none', background: 'transparent'
          }}
        />
      ) : (
        <span 
          onDoubleClick={() => setIsEditing(true)} 
          style={{ 
            position: 'relative', zIndex: 1, 
            fontSize: 9, cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}

// ===== Text Node =====
function TextNode({ data, selected }: NodeProps<DiagramNodeData>) {
  const [text, setText] = useState(data?.label || 'Text')
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div style={{
      padding: '4px 8px',
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 11,
      background: selected ? '#EEF4FF' : 'transparent',
      border: selected ? '1px dashed #316AC5' : '1px dashed transparent',
      minWidth: 50,
    }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0.3 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0.3 }} />
      
      {isEditing ? (
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
          style={{ width: '100%', fontSize: 11, border: 'none', background: 'transparent' }}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>{text}</span>
      )}
    </div>
  )
}

// ===== Edge Types =====
function AssociationEdge({ id, sourceX, sourceY, targetX, targetY, data, label }: EdgeProps) {
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const d = data as DiagramNodeData | undefined

  return (
    <>
      <BaseEdge 
        id={id} 
        path={path} 
        markerEnd={d?.cardinality ? `url(#arrow-${id})` : undefined}
        style={{ strokeWidth: 1.5, stroke: '#333' }} 
      />
      {(label || d?.cardinality) && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '1px 4px',
            fontSize: 10,
            fontFamily: 'Tahoma, sans-serif',
            border: '1px solid #ccc',
            borderRadius: 2,
          }}>
            {label || d?.cardinality}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes: NodeTypes = {
  umlClass: UMLClassNode,
  entity: EntityNode,
  relation: RelationNode,
  attribute: AttributeNode,
  gpsBox: GPSBoxNode,
  logicOperator: LogicOperatorNode,
  startEnd: StartEndNode,
  textNode: TextNode,
}

const edgeTypes = {
  association: AssociationEdge,
}

// ===== Shape Palette Item =====
function ShapePaletteItem({ 
  type, label, icon, onDragStart 
}: { 
  type: DiagramNodeType
  label: string
  icon: React.ReactNode
  onDragStart: (type: DiagramNodeType) => void
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(type)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px',
        cursor: 'grab',
        border: '1px solid transparent',
        borderRadius: 4,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#EEF4FF'
        e.currentTarget.style.borderColor = '#316AC5'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: 9, textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

// ===== Diagram Canvas Component =====
function DiagramCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DiagramNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<DiagramNodeData>>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<'uml' | 'erm' | 'gpm'>('uml')
  const [connectMode, setConnectMode] = useState<'association' | 'attribute' | null>(null)
  const [showCardDialog, setShowCardDialog] = useState<{ from: string; to: string } | null>(null)
  const [cardinality, setCardinality] = useState('1')
  
  const { screenToFlowPosition } = useReactFlow()
  const dragType = useRef<DiagramNodeType | null>(null)

  let nodeId = useRef(1)
  let edgeId = useRef(1)

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    if (!dragType.current) return

    const position = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    })

    const type = dragType.current
    const newNode: Node<DiagramNodeData> = {
      id: `node-${nodeId.current++}`,
      type,
      position,
      data: getDefaultData(type),
    }

    setNodes((nds) => [...nds, newNode])
    dragType.current = null
  }, [screenToFlowPosition, setNodes])

  const getDefaultData = (type: DiagramNodeType): DiagramNodeData => {
    switch (type) {
      case 'umlClass':
        return { label: 'ClassName', attributes: ['- attribute: Type'], operations: ['+ method(): void'] }
      case 'entity':
        return { label: 'Entity' }
      case 'relation':
        return { label: 'Relation' }
      case 'attribute':
        return { label: 'Attribute', isKey: false }
      case 'gpsBox':
        return { label: 'GPS Name', gpsId: '1.0', gpsApp: 'App', gpsModule: 'Module' }
      case 'logicOperator':
        return { logicType: 'OR' }
      case 'startEnd':
        return { label: 'Start' }
      case 'textNode':
        return { label: 'Text' }
      default:
        return {}
    }
  }

  const onConnect = useCallback((connection: Connection) => {
    if (!connectMode) return
    
    const from = connection.source!
    const to = connection.target!
    
    if (connectMode === 'association') {
      setShowCardDialog({ from, to })
    } else {
      // Attribute connection
      setEdges((eds) => addEdge({
        ...connection,
        id: `edge-${edgeId.current++}`,
        style: { strokeWidth: 1, stroke: '#666', strokeDasharray: '3,3' },
      }, eds))
    }
  }, [connectMode, setEdges])

  const saveCardEdge = () => {
    if (!showCardDialog) return
    
    setEdges((eds) => addEdge({
      source: showCardDialog.from,
      target: showCardDialog.to,
      id: `edge-${edgeId.current++}`,
      type: 'association',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { cardinality },
      label: cardinality,
    }, eds))
    
    setShowCardDialog(null)
    setCardinality('1')
  }

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nds => nds.filter(n => n.id !== selectedNode))
      setEdges(eds => eds.filter(e => e.source !== selectedNode && e.target !== selectedNode))
      setSelectedNode(null)
    }
  }

  const onDragStart = (type: DiagramNodeType) => {
    dragType.current = type
  }

  // Shape Icons
  const UMLIcon = () => (
    <div style={{ width: 28, height: 24, border: '2px solid #333', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 6, borderBottom: '1px solid #333' }} />
      <div style={{ height: 8, borderBottom: '1px solid #333' }} />
      <div style={{ flex: 1 }} />
    </div>
  )

  const EntityIcon = () => (
    <div style={{ width: 28, height: 18, border: '2px solid #333' }} />
  )

  const RelationIcon = () => (
    <svg width="28" height="24" viewBox="0 0 28 24">
      <polygon points="14,2 26,12 14,22 2,12" fill="none" stroke="#333" strokeWidth="2" />
    </svg>
  )

  const AttributeIcon = () => (
    <div style={{ width: 28, height: 18, border: '2px solid #888', borderRadius: '50%' }} />
  )

  const GPSIcon = () => (
    <div style={{ width: 28, height: 22, border: '2px solid #333', borderRadius: 4, display: 'grid', gridTemplate: '6px 1fr 6px / 1fr 1fr', fontSize: 5 }}>
      <div style={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>ID</div>
      <div style={{ borderBottom: '1px solid #ccc' }} />
      <div style={{ gridColumn: '1/3', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Name</div>
      <div style={{ borderRight: '1px solid #ccc' }}>App</div>
      <div>Mod</div>
    </div>
  )

  const LogicIcon = (symbol: string, color: string) => () => (
    <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', color }}>
      {symbol}
    </div>
  )

  const StartEndIcon = () => (
    <svg width="28" height="20" viewBox="0 0 28 20">
      <polygon points="2,10 20,2 26,2 26,18 20,18" fill="#D4EDDA" stroke="#28A745" strokeWidth="2" />
    </svg>
  )

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* Left Shape Palette */}
      <div style={{
        width: 140,
        background: '#ECE9D8',
        borderRight: '1px solid #ACA899',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ACA899' }}>
          {(['uml', 'erm', 'gpm'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: 10,
                fontWeight: activeCategory === cat ? 'bold' : 'normal',
                background: activeCategory === cat ? '#fff' : '#ECE9D8',
                border: 'none',
                borderBottom: activeCategory === cat ? '2px solid #316AC5' : 'none',
                cursor: 'pointer',
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Shapes */}
        <div style={{ padding: 8 }}>
          {activeCategory === 'uml' && (
            <>
              <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#666' }}>UML-Klassen</div>
              <ShapePaletteItem type="umlClass" label="UML-Klasse" icon={<UMLIcon />} onDragStart={onDragStart} />
              <ShapePaletteItem type="textNode" label="Text" icon={<span style={{ fontSize: 16 }}>T</span>} onDragStart={onDragStart} />
            </>
          )}

          {activeCategory === 'erm' && (
            <>
              <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#666' }}>ERM-Elemente</div>
              <ShapePaletteItem type="entity" label="Entität" icon={<EntityIcon />} onDragStart={onDragStart} />
              <ShapePaletteItem type="relation" label="Beziehung" icon={<RelationIcon />} onDragStart={onDragStart} />
              <ShapePaletteItem type="attribute" label="Attribut" icon={<AttributeIcon />} onDragStart={onDragStart} />
            </>
          )}

          {activeCategory === 'gpm' && (
            <>
              <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#666' }}>Prozess-Elemente</div>
              <ShapePaletteItem type="gpsBox" label="GPS-Box" icon={<GPSIcon />} onDragStart={onDragStart} />
              <ShapePaletteItem type="logicOperator" label="ODER" icon={<LogicIcon('∨', '#FFC107') />} onDragStart={onDragStart} />
              <ShapePaletteItem type="startEnd" label="Start/Ende" icon={<StartEndIcon />} onDragStart={onDragStart} />
              <ShapePaletteItem type="textNode" label="Text" icon={<span style={{ fontSize: 16 }}>T</span>} onDragStart={onDragStart} />
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #ACA899', margin: '8px 0' }} />

        {/* Connection Tools */}
        <div style={{ padding: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#666' }}>Verbindungen</div>
          <button
            onClick={() => setConnectMode(m => m === 'association' ? null : 'association')}
            style={{
              width: '100%',
              padding: '6px 8px',
              marginBottom: 4,
              fontSize: 10,
              background: connectMode === 'association' ? '#316AC5' : '#fff',
              color: connectMode === 'association' ? '#fff' : '#000',
              border: '1px solid #ACA899',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            → Assoziation
          </button>
          <button
            onClick={() => setConnectMode(m => m === 'attribute' ? null : 'attribute')}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 10,
              background: connectMode === 'attribute' ? '#316AC5' : '#fff',
              color: connectMode === 'attribute' ? '#fff' : '#000',
              border: '1px solid #ACA899',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            - - Attribut
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #ACA899', margin: '8px 0' }} />

        {/* Actions */}
        <div style={{ padding: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#666' }}>Aktionen</div>
          <button
            onClick={deleteSelected}
            disabled={!selectedNode}
            style={{
              width: '100%',
              padding: '6px 8px',
              marginBottom: 4,
              fontSize: 10,
              background: selectedNode ? '#fff' : '#f0f0f0',
              border: '1px solid #ACA899',
              borderRadius: 3,
              cursor: selectedNode ? 'pointer' : 'not-allowed',
              opacity: selectedNode ? 1 : 0.5,
            }}
          >
            🗑️ Löschen
          </button>
          <button
            onClick={() => { setNodes([]); setEdges([]); }}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 10,
              background: '#fff',
              border: '1px solid #ACA899',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            ↺ Leeren
          </button>
        </div>

        {/* Help Text */}
        <div style={{ 
          marginTop: 'auto', 
          padding: 8, 
          fontSize: 9, 
          color: '#666',
          borderTop: '1px solid #ACA899',
          background: '#F8F7F0',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Hinweise:</div>
          <div>• Formen per Drag & Drop hinzufügen</div>
          <div>• Doppelklick zum Bearbeiten</div>
          <div>• Verbindungen: Modus wählen, dann von Handle zu Handle ziehen</div>
        </div>
      </div>

      {/* Main Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, n) => setSelectedNode(n.id)}
          onPaneClick={() => setSelectedNode(null)}
          fitView
          style={{ background: '#fff' }}
        >
          <Background gap={10} size={1} />
          <Controls />
          <MiniMap 
            style={{
              background: '#ECE9D8',
              border: '1px solid #ACA899',
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Cardinality Dialog */}
        {showCardDialog && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: '#ECE9D8',
              border: '1px solid #ACA899',
              borderRadius: 4,
              boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              width: 280,
            }}>
              <div style={{
                background: 'linear-gradient(to right, #1A4DAA, #316AC5)',
                color: 'white',
                padding: '6px 10px',
                fontWeight: 'bold',
                fontSize: 11,
              }}>
                Kardinalität eingeben
              </div>
              <div style={{ padding: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 10 }}>
                  Kardinalität (z.B. 1, 0..*, 1..n):
                </label>
                <input
                  type="text"
                  value={cardinality}
                  onChange={e => setCardinality(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveCardEdge()}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    fontSize: 11,
                    border: '1px solid #ACA899',
                    borderRadius: 2,
                  }}
                />
                <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                  Beispiele: 1, 0..1, 1..*, n, m, mc
                </div>
              </div>
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid #ACA899',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}>
                <button
                  onClick={() => setShowCardDialog(null)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 10,
                    background: '#ECE9D8',
                    border: '1px solid #ACA899',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveCardEdge}
                  style={{
                    padding: '4px 12px',
                    fontSize: 10,
                    background: '#316AC5',
                    color: 'white',
                    border: '1px solid #1A4DAA',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== Export with Provider =====
export default function DiagramCanvas() {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner />
    </ReactFlowProvider>
  )
}
