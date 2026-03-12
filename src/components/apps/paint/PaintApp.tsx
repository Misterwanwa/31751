'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ===== Types =====
type Tool = 
  | 'freeSelect' | 'select' | 'eraser' | 'fill' | 'pickColor' | 'magnifier'
  | 'pencil' | 'brush' | 'airbrush' | 'text'
  | 'line' | 'curve' | 'rect' | 'polygon' | 'ellipse' | 'roundRect'

interface Point { x: number; y: number }
interface HistoryState { imageData: ImageData; width: number; height: number }

// ===== Constants =====
const COLORS = [
  // Row 1
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200',
  '#22B14C', '#00A2E8', '#3F48CC', '#A349A4', '#FFFFFF', '#C3C3C3',
  '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7',
  // Row 2 - remaining colors
  '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4',
]

const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#00FFFF', '#FF00FF', '#C0C0C0', '#808080', '#800000', '#808000',
  '#008000', '#008080', '#000080', '#800080', '#7F7F7F', '#C3C3C3',
  '#FFAEC9', '#FF7F27', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA',
  '#7092BE', '#C8BFE7', '#880015', '#ED1C24'
]

const BRUSH_SIZES = [1, 2, 3, 4, 5]

// ===== Flood Fill Algorithm =====
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  // Parse fill color
  const tempCtx = document.createElement('canvas').getContext('2d')!
  tempCtx.fillStyle = fillColor
  tempCtx.fillRect(0, 0, 1, 1)
  const fillData = tempCtx.getImageData(0, 0, 1, 1).data
  const [fr, fg, fb, fa] = [fillData[0], fillData[1], fillData[2], fillData[3]]
  
  // Get target color at click position
  const targetIdx = (y * width + x) * 4
  const [tr, tg, tb, ta] = [data[targetIdx], data[targetIdx + 1], data[targetIdx + 2], data[targetIdx + 3]]
  
  // If same color, return
  if (tr === fr && tg === fg && tb === fb && ta === fa) return
  
  const stack: [number, number][] = [[x, y]]
  const visited = new Set<number>()
  
  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    const idx = (cy * width + cx) * 4
    
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue
    if (visited.has(idx)) continue
    
    const [cr, cg, cb, ca] = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    if (cr !== tr || cg !== tg || cb !== tb || ca !== ta) continue
    
    visited.add(idx)
    data[idx] = fr
    data[idx + 1] = fg
    data[idx + 2] = fb
    data[idx + 3] = fa
    
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }
  
  ctx.putImageData(imageData, 0, 0)
}

// ===== Tool Icons (SVG) =====
const ToolIcons: Record<Tool, string> = {
  freeSelect: 'M2,2 L8,5 L5,8 L12,15 L15,12 L8,5 L14,2 Z',
  select: 'M2,2 H14 V14 H2 Z M4,4 H12 V12 H4 Z',
  eraser: 'M4,4 L12,4 L14,6 L14,10 L10,14 L6,14 L4,12 Z',
  fill: 'M6,2 L10,2 L10,4 L12,4 L8,14 L4,4 L6,4 Z',
  pickColor: 'M10,2 L14,6 L6,14 L2,14 L2,10 Z',
  magnifier: 'M6,2 A4,4 0 1,0 6,10 A4,4 0 1,0 6,2 M10,10 L14,14',
  pencil: 'M2,12 L2,14 L4,14 L12,6 L10,4 Z',
  brush: 'M2,12 Q6,8 10,2 Q12,4 14,6 Q8,10 4,14 Z',
  airbrush: 'M8,2 A6,6 0 1,0 8,14 A6,6 0 1,0 8,2 M8,6 A2,2 0 1,1 8,10',
  text: 'M4,4 H12 M8,4 V12 M6,12 H10',
  line: 'M2,12 L12,2',
  curve: 'M2,8 Q6,2 10,8 Q12,12 14,10',
  rect: 'M2,4 H14 V12 H2 Z',
  polygon: 'M8,2 L14,6 L12,14 L4,14 L2,6 Z',
  ellipse: 'M8,2 A6,4 0 1,0 8,14 A6,4 0 1,0 8,2',
  roundRect: 'M4,2 H12 A2,2 0 0,1 14,4 V12 A2,2 0 0,1 12,14 H4 A2,2 0 0,1 2,12 V4 A2,2 0 0,1 4,2',
}

const ToolNames: Record<Tool, string> = {
  freeSelect: 'Free-form Select',
  select: 'Select',
  eraser: 'Eraser/Color Eraser',
  fill: 'Fill With Color',
  pickColor: 'Pick Color',
  magnifier: 'Magnifier',
  pencil: 'Pencil',
  brush: 'Brush',
  airbrush: 'Airbrush',
  text: 'Text',
  line: 'Line',
  curve: 'Curve',
  rect: 'Rectangle',
  polygon: 'Polygon',
  ellipse: 'Ellipse',
  roundRect: 'Rounded Rectangle',
}

const ToolsRow1: Tool[] = ['freeSelect', 'select', 'eraser', 'fill', 'pickColor', 'magnifier']
const ToolsRow2: Tool[] = ['pencil', 'brush', 'airbrush', 'text', 'line', 'curve']
const ToolsRow3: Tool[] = ['rect', 'polygon', 'ellipse', 'roundRect']

export default function PaintApp() {
  // ===== State =====
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<Tool>('pencil')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [brushSize, setBrushSize] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<Point | null>(null)
  const [currentPos, setCurrentPos] = useState<Point>({ x: 0, y: 0 })
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 })
  const [fillShape, setFillShape] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPos, setTextPos] = useState<Point | null>(null)
  const [magnification, setMagnification] = useState(1)

  // ===== Canvas Setup =====
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ imageData, width: canvas.width, height: canvas.height })
      if (newHistory.length > 20) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 19))
  }, [historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      if (state && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!
        ctx.putImageData(state.imageData, 0, 0)
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }

  const newCanvas = () => {
    clearCanvas()
    setCanvasSize({ width: 640, height: 480 })
  }

  // ===== Drawing Functions =====
  const getCanvasCoordinates = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.floor((e.clientX - rect.left) / magnification),
      y: Math.floor((e.clientY - rect.top) / magnification)
    }
  }

  const startDrawing = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentPos(pos)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    if (activeTool === 'fill') {
      floodFill(ctx, pos.x, pos.y, fgColor)
      saveToHistory()
      setIsDrawing(false)
      return
    }

    if (activeTool === 'pickColor') {
      const imageData = ctx.getImageData(pos.x, pos.y, 1, 1)
      const [r, g, b] = [imageData.data[0], imageData.data[1], imageData.data[2]]
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      if (e.button === 2) setBgColor(hex)
      else setFgColor(hex)
      setIsDrawing(false)
      return
    }

    if (activeTool === 'text') {
      setTextPos(pos)
      setIsDrawing(false)
      return
    }

    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (activeTool === 'pencil' || activeTool === 'brush') {
      ctx.strokeStyle = fgColor
      ctx.lineWidth = activeTool === 'pencil' ? 1 : brushSize * 2
      ctx.moveTo(pos.x, pos.y)
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = bgColor
      ctx.lineWidth = brushSize * 4
      ctx.moveTo(pos.x, pos.y)
    } else if (activeTool === 'airbrush') {
      // Airbrush spray effect
      spray(ctx, pos.x, pos.y, fgColor)
    }
  }

  const spray = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    const density = 30
    const radius = brushSize * 5
    ctx.fillStyle = color
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * radius
      const px = x + Math.cos(angle) * dist
      const py = y + Math.sin(angle) * dist
      ctx.fillRect(px, py, 1, 1)
    }
  }

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return
    const pos = getCanvasCoordinates(e)
    setCurrentPos(pos)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    if (activeTool === 'pencil' || activeTool === 'brush' || activeTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (activeTool === 'airbrush') {
      spray(ctx, pos.x, pos.y, fgColor)
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas || !startPos) return
    const ctx = canvas.getContext('2d')!

    // Draw shapes
    if (['line', 'rect', 'ellipse', 'roundRect'].includes(activeTool)) {
      ctx.beginPath()
      ctx.strokeStyle = fgColor
      ctx.fillStyle = bgColor
      ctx.lineWidth = 1

      if (activeTool === 'line') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(currentPos.x, currentPos.y)
        ctx.stroke()
      } else if (activeTool === 'rect') {
        const w = currentPos.x - startPos.x
        const h = currentPos.y - startPos.y
        if (fillShape) {
          ctx.fillRect(startPos.x, startPos.y, w, h)
        }
        ctx.strokeRect(startPos.x, startPos.y, w, h)
      } else if (activeTool === 'ellipse') {
        const cx = (startPos.x + currentPos.x) / 2
        const cy = (startPos.y + currentPos.y) / 2
        const rx = Math.abs(currentPos.x - startPos.x) / 2
        const ry = Math.abs(currentPos.y - startPos.y) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        if (fillShape) ctx.fill()
        ctx.stroke()
      }

      saveToHistory()
    } else if (['pencil', 'brush', 'eraser', 'airbrush'].includes(activeTool)) {
      saveToHistory()
    }
  }

  const addText = () => {
    if (!textPos || !textInput) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.font = '14px Arial'
    ctx.fillStyle = fgColor
    ctx.fillText(textInput, textPos.x, textPos.y + 14)
    saveToHistory()
    setTextInput('')
    setTextPos(null)
  }

  // ===== Init =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }, [])

  // ===== Menu Actions =====
  const menuAction = (action: string) => {
    setShowMenu(null)
    switch (action) {
      case 'new': newCanvas(); break
      case 'clear': clearCanvas(); break
      case 'undo': undo(); break
      case 'exit': break
    }
  }

  // ===== Styles =====
  const xpMenuBarStyle: React.CSSProperties = {
    display: 'flex',
    background: 'linear-gradient(to bottom, #FFFFFF 0%, #ECE9D8 100%)',
    borderBottom: '1px solid #ACA899',
    padding: '1px 0',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 11,
  }

  const xpMenuItemStyle: React.CSSProperties = {
    padding: '2px 8px',
    cursor: 'pointer',
    border: '1px solid transparent',
  }

  const xpBoxStyle: React.CSSProperties = {
    background: '#ECE9D8',
    border: '1px solid #ACA899',
    borderRadius: 2,
    boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: '#7F9EDA',
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 11,
    }}>
      {/* Menu Bar */}
      <div style={xpMenuBarStyle}>
        {['File', 'Edit', 'View', 'Image', 'Colors', 'Help'].map(menu => (
          <div 
            key={menu}
            style={{ position: 'relative' }}
            onMouseEnter={() => showMenu && setShowMenu(menu)}
          >
            <div
              style={{
                ...xpMenuItemStyle,
                background: showMenu === menu ? '#316AC5' : 'transparent',
                color: showMenu === menu ? '#FFFFFF' : '#000000',
              }}
              onClick={() => setShowMenu(showMenu === menu ? null : menu)}
            >
              {menu}
            </div>
            {showMenu === menu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#FFFFFF',
                border: '1px solid #ACA899',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: 120,
              }}>
                {menu === 'File' && (
                  <>
                    <MenuItem onClick={() => menuAction('new')}>New <span style={{ marginLeft: 20 }}>Ctrl+N</span></MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={() => menuAction('exit')}>Exit</MenuItem>
                  </>
                )}
                {menu === 'Edit' && (
                  <>
                    <MenuItem onClick={() => menuAction('undo')}>Undo <span style={{ marginLeft: 20 }}>Ctrl+Z</span></MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={() => menuAction('clear')}>Clear Selection</MenuItem>
                    <MenuItem>Select All</MenuItem>
                    <MenuDivider />
                    <MenuItem>Cut</MenuItem>
                    <MenuItem>Copy</MenuItem>
                    <MenuItem>Paste</MenuItem>
                  </>
                )}
                {menu === 'View' && (
                  <>
                    <MenuItem onClick={() => setMagnification(1)}>Normal Size</MenuItem>
                    <MenuItem onClick={() => setMagnification(2)}>Large Size</MenuItem>
                    <MenuDivider />
                    <MenuItem>Grid</MenuItem>
                    <MenuItem>Thumbnail</MenuItem>
                  </>
                )}
                {menu === 'Image' && (
                  <>
                    <MenuItem>Flip/Rotate...</MenuItem>
                    <MenuItem>Stretch/Skew...</MenuItem>
                    <MenuItem>Invert Colors</MenuItem>
                    <MenuDivider />
                    <MenuItem>Attributes...</MenuItem>
                    <MenuItem>Clear Image</MenuItem>
                    <MenuItem>Draw Opaque</MenuItem>
                  </>
                )}
                {menu === 'Colors' && (
                  <>
                    <MenuItem>Edit Colors...</MenuItem>
                    <MenuItem>Get Colors</MenuItem>
                    <MenuItem>Save Colors</MenuItem>
                  </>
                )}
                {menu === 'Help' && (
                  <>
                    <MenuItem>Help Topics</MenuItem>
                    <MenuDivider />
                    <MenuItem>About Paint</MenuItem>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Toolbox + Colors */}
        <div style={{ 
          width: 58, 
          background: '#ECE9D8',
          borderRight: '1px solid #ACA899',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {/* Toolbox */}
          <div style={{ ...xpBoxStyle, padding: 2 }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
              {ToolsRow1.map(tool => (
                <ToolButton 
                  key={tool} 
                  tool={tool} 
                  active={activeTool === tool} 
                  onClick={() => setActiveTool(tool)}
                />
              ))}
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
              {ToolsRow2.map(tool => (
                <ToolButton 
                  key={tool} 
                  tool={tool} 
                  active={activeTool === tool} 
                  onClick={() => setActiveTool(tool)}
                />
              ))}
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {ToolsRow3.map(tool => (
                <ToolButton 
                  key={tool} 
                  tool={tool} 
                  active={activeTool === tool} 
                  onClick={() => setActiveTool(tool)}
                />
              ))}
            </div>
          </div>

          {/* Options Box */}
          <div style={{ ...xpBoxStyle, padding: 4, minHeight: 60 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Options</div>
            {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'airbrush') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 9 }}>Size:</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {BRUSH_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      style={{
                        width: 16,
                        height: 16,
                        padding: 0,
                        border: brushSize === size ? '2px solid #316AC5' : '1px solid #ACA899',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: size * 2,
                        height: size * 2,
                        background: '#000',
                        borderRadius: '50%',
                        margin: 'auto',
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'roundRect') && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={fillShape}
                  onChange={e => setFillShape(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Fill
              </label>
            )}
          </div>

          {/* Colors Box */}
          <div style={{ ...xpBoxStyle, padding: 4, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Colors</div>
            
            {/* Current colors preview */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: 8,
            }}>
              <div style={{ position: 'relative', width: 36, height: 28 }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 18,
                    height: 22,
                    background: fgColor,
                    border: '1px solid #000',
                    zIndex: 2,
                  }}
                  title="Foreground"
                />
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 18,
                    height: 22,
                    background: bgColor,
                    border: '1px solid #000',
                    zIndex: 1,
                  }}
                  title="Background"
                />
              </div>
            </div>

            {/* Color palette */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(14, 1fr)',
              gap: 0,
            }}>
              {DEFAULT_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={e => {
                    if (e.button === 2 || e.ctrlKey) setBgColor(color)
                    else setFgColor(color)
                  }}
                  onContextMenu={e => {
                    e.preventDefault()
                    setBgColor(color)
                  }}
                  style={{
                    width: 14,
                    height: 14,
                    padding: 0,
                    border: '1px solid #ACA899',
                    background: color,
                    cursor: 'pointer',
                  }}
                  title={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          style={{ 
            flex: 1, 
            background: '#7F9EDA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: 20,
          }}
          onClick={() => setShowMenu(null)}
        >
          <div style={{
            background: '#808080',
            padding: 2,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              style={{
                background: '#FFFFFF',
                cursor: getCursor(activeTool),
                imageRendering: 'pixelated',
                width: canvasSize.width * magnification,
                height: canvasSize.height * magnification,
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </div>
      </div>

      {/* Text Input Dialog */}
      {textPos && (
        <div style={{
          position: 'absolute',
          left: textPos.x * magnification + 100,
          top: textPos.y * magnification + 100,
          background: '#FFFFFF',
          border: '1px solid #316AC5',
          padding: 4,
          zIndex: 1000,
        }}>
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addText()
              if (e.key === 'Escape') {
                setTextInput('')
                setTextPos(null)
              }
            }}
            placeholder="Enter text..."
            autoFocus
            style={{ fontSize: 12, padding: 2 }}
          />
          <button onClick={addText} style={{ marginLeft: 4, fontSize: 11 }}>OK</button>
        </div>
      )}

      {/* Status Bar */}
      <div style={{
        height: 20,
        background: '#ECE9D8',
        borderTop: '1px solid #ACA899',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        fontSize: 11,
      }}>
        <div style={{ flex: 1 }}>
          {ToolNames[activeTool]}
        </div>
        <div style={{ 
          borderLeft: '1px solid #ACA899', 
          padding: '0 8px',
          display: 'flex',
          gap: 16,
        }}>
          <span>For Help, click Help Topics on the Help Menu.</span>
          <span>{currentPos.x}, {currentPos.y}px</span>
        </div>
      </div>
    </div>
  )
}

// ===== Subcomponents =====
function ToolButton({ tool, active, onClick }: { tool: Tool; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={ToolNames[tool]}
      style={{
        width: 23,
        height: 23,
        padding: 2,
        border: active 
          ? '2px solid #316AC5' 
          : '1px solid #ACA899',
        background: active ? '#E5E5E5' : '#F0F0F0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16">
        <path 
          d={ToolIcons[tool]} 
          fill="none" 
          stroke="#000" 
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#316AC5'
        ;(e.currentTarget as HTMLDivElement).style.color = '#FFFFFF'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLDivElement).style.color = '#000000'
      }}
    >
      {children}
    </div>
  )
}

function MenuDivider() {
  return (
    <div style={{
      height: 1,
      background: '#ACA899',
      margin: '2px 4px',
    }} />
  )
}

function getCursor(tool: Tool): string {
  switch (tool) {
    case 'pencil': return 'crosshair'
    case 'brush': return 'crosshair'
    case 'eraser': return 'cell'
    case 'fill': return 'crosshair'
    case 'text': return 'text'
    case 'pickColor': return 'crosshair'
    case 'magnifier': return 'zoom-in'
    default: return 'default'
  }
}
