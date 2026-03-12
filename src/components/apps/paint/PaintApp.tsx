'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ===== Types =====
type Tool = 
  | 'freeSelect' | 'select' | 'eraser' | 'fill' | 'pickColor' | 'magnifier'
  | 'pencil' | 'brush' | 'airbrush' | 'text' | 'line' | 'curve'
  | 'rect' | 'polygon' | 'ellipse' | 'roundRect'

interface Point { x: number; y: number }

// ===== Tool Layout (2 columns like original) =====
const TOOLS: { id: Tool; hint: string; render: (active: boolean) => React.ReactNode }[][] = [
  [
    { id: 'freeSelect', hint: 'Free-form Select', render: () => <span style={{ fontSize: 10 }}>✂</span> },
    { id: 'select', hint: 'Select', render: () => <span style={{ fontSize: 10 }}>▭</span> },
  ],
  [
    { id: 'eraser', hint: 'Eraser/Color Eraser', render: () => <span style={{ fontSize: 10 }}>◫</span> },
    { id: 'fill', hint: 'Fill With Color', render: () => <span style={{ fontSize: 10 }}>▼</span> },
  ],
  [
    { id: 'pickColor', hint: 'Pick Color', render: () => <span style={{ fontSize: 10 }}>⚲</span> },
    { id: 'magnifier', hint: 'Magnifier', render: () => <span style={{ fontSize: 10 }}>⚹</span> },
  ],
  [
    { id: 'pencil', hint: 'Pencil', render: () => <span style={{ fontSize: 10 }}>✎</span> },
    { id: 'brush', hint: 'Brush', render: () => <span style={{ fontSize: 10 }}>✐</span> },
  ],
  [
    { id: 'airbrush', hint: 'Airbrush', render: () => <span style={{ fontSize: 10 }}>⌼</span> },
    { id: 'text', hint: 'Text', render: () => <span style={{ fontSize: 12, fontWeight: 'bold', fontFamily: 'Times' }}>A</span> },
  ],
  [
    { id: 'line', hint: 'Line', render: () => <span style={{ fontSize: 10 }}>╱</span> },
    { id: 'curve', hint: 'Curve', render: () => <span style={{ fontSize: 10 }}>∿</span> },
  ],
  [
    { id: 'rect', hint: 'Rectangle', render: () => <span style={{ fontSize: 10 }}>▭</span> },
    { id: 'polygon', hint: 'Polygon', render: () => <span style={{ fontSize: 10 }}>⬠</span> },
  ],
  [
    { id: 'ellipse', hint: 'Ellipse', render: () => <span style={{ fontSize: 10 }}>⬭</span> },
    { id: 'roundRect', hint: 'Rounded Rectangle', render: () => <span style={{ fontSize: 10 }}>▢</span> },
  ],
]

// ===== 28 Colors like original Paint =====
const COLOR_PALETTE = [
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200',
  '#22B14C', '#00A2E8', '#3F48CC', '#A349A4', '#FFFFFF', '#C3C3C3',
  '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7',
  '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4',
]

// XP Style Colors
const XP_BG = '#ECE9D8'
const XP_BORDER = '#ACA899'

export default function PaintApp() {
  // ===== State =====
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<Tool>('pencil')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<Point | null>(null)
  const [currentPos, setCurrentPos] = useState<Point>({ x: 0, y: 0 })
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [canvasSize] = useState({ width: 640, height: 480 })
  const [statusText, setStatusText] = useState('For Help, click Help Topics on the Help Menu.')
  const [brushSize, setBrushSize] = useState(2)
  const [fillShapes, setFillShapes] = useState(false)

  // ===== Canvas Functions =====
  const getCanvasCoordinates = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.floor(e.clientX - rect.left),
      y: Math.floor(e.clientY - rect.top)
    }
  }

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(imageData)
      if (newHistory.length > 10) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 9))
  }, [historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const state = history[newIndex]
      if (state && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!
        ctx.putImageData(state, 0, 0)
      }
    }
  }

  const newImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }

  // ===== Flood Fill =====
  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.fillStyle = fillColor
    tempCtx.fillRect(0, 0, 1, 1)
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data
    const [fr, fg, fb, fa] = [fillData[0], fillData[1], fillData[2], fillData[3]]
    
    const targetIdx = (y * width + x) * 4
    const [tr, tg, tb, ta] = [data[targetIdx], data[targetIdx + 1], data[targetIdx + 2], data[targetIdx + 3]]
    
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

  // ===== Drawing Functions =====
  const startDrawing = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e)
    setIsDrawing(true)
    setStartPos(pos)
    setCurrentPos(pos)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    if (activeTool === 'fill') {
      floodFill(ctx, pos.x, pos.y, e.button === 2 ? bgColor : fgColor)
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

    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = fgColor

    if (activeTool === 'pencil') {
      ctx.lineWidth = 1
      ctx.moveTo(pos.x, pos.y)
    } else if (activeTool === 'brush') {
      ctx.lineWidth = brushSize * 2
      ctx.moveTo(pos.x, pos.y)
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = bgColor
      ctx.lineWidth = brushSize * 4
      ctx.moveTo(pos.x, pos.y)
    } else if (activeTool === 'airbrush') {
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
      ctx.fillRect(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 1, 1)
    }
  }

  const draw = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e)
    setCurrentPos(pos)
    
    if (!isDrawing) return

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

    if (['line', 'rect', 'ellipse'].includes(activeTool)) {
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
        if (fillShapes) ctx.fillRect(startPos.x, startPos.y, w, h)
        ctx.strokeRect(startPos.x, startPos.y, w, h)
      } else if (activeTool === 'ellipse') {
        const cx = (startPos.x + currentPos.x) / 2
        const cy = (startPos.y + currentPos.y) / 2
        const rx = Math.abs(currentPos.x - startPos.x) / 2
        const ry = Math.abs(currentPos.y - startPos.y) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        if (fillShapes) ctx.fill()
        ctx.stroke()
      }
      saveToHistory()
    } else if (['pencil', 'brush', 'eraser', 'airbrush'].includes(activeTool)) {
      saveToHistory()
    }
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

  // ===== Styles =====
  const menuItemStyle = (menu: string): React.CSSProperties => ({
    padding: '1px 8px',
    cursor: 'pointer',
    border: activeMenu === menu ? '1px solid #ACA899' : '1px solid transparent',
    background: activeMenu === menu ? '#FFFFFF' : 'transparent',
  })

  const toolBtnStyle = (tool: Tool): React.CSSProperties => ({
    width: 24,
    height: 24,
    border: activeTool === tool 
      ? '2px solid #C56A31' 
      : '1px solid #F1EFE2',
    background: activeTool === tool ? '#E3E0D1' : '#ECE9D8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: XP_BG,
      fontFamily: 'Tahoma, sans-serif',
      fontSize: 11,
      overflow: 'hidden',
    }}>
      {/* ===== MENU BAR ===== */}
      <div style={{
        display: 'flex',
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #ECE9D8 100%)',
        borderBottom: '1px solid #ACA899',
        padding: '1px 2px',
      }}>
        {['File', 'Edit', 'View', 'Image', 'Colors', 'Help'].map(menu => (
          <div key={menu} style={{ position: 'relative' }}>
            <div
              style={menuItemStyle(menu)}
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu)}
            >
              <span style={{ textDecoration: menu === 'Help' ? 'underline' : 'none' }}>
                {menu === 'Help' ? 'H' : menu[0]}
              </span>
              {menu.slice(1)}
            </div>
            {activeMenu === menu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#FFFFFF',
                border: '1px solid #ACA899',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: 150,
              }}>
              {menu === 'File' && (
                <>
                  <MenuItem onClick={() => { newImage(); setActiveMenu(null) }}>New<span style={floatRight}>Ctrl+N</span></MenuItem>
                  <MenuItem>Open...<span style={floatRight}>Ctrl+O</span></MenuItem>
                  <MenuItem>Save<span style={floatRight}>Ctrl+S</span></MenuItem>
                  <MenuItem>Save As...</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => setActiveMenu(null)}>Exit</MenuItem>
                </>
              )}
              {menu === 'Edit' && (
                <>
                  <MenuItem onClick={() => { undo(); setActiveMenu(null) }}>Undo<span style={floatRight}>Ctrl+Z</span></MenuItem>
                  <MenuDivider />
                  <MenuItem>Cut<span style={floatRight}>Ctrl+X</span></MenuItem>
                  <MenuItem>Copy<span style={floatRight}>Ctrl+C</span></MenuItem>
                  <MenuItem>Paste<span style={floatRight}>Ctrl+V</span></MenuItem>
                  <MenuDivider />
                  <MenuItem>Select All</MenuItem>
                </>
              )}
              {menu === 'View' && (
                <>
                  <MenuItem>Zoom →</MenuItem>
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
                  <MenuItem>Attributes...</MenuItem>
                  <MenuItem>Clear Image</MenuItem>
                </>
              )}
              {menu === 'Colors' && (
                <>
                  <MenuItem>Edit Colors...</MenuItem>
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

      {/* ===== MAIN AREA ===== */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ===== LEFT SIDEBAR (Toolbar + Options) ===== */}
        <div style={{ 
          width: 56, 
          background: XP_BG,
          borderRight: '1px solid #ACA899',
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 2px',
          gap: 4,
        }}>
          {/* Tools Box */}
          <div style={{
            border: '1px solid #ACA899',
            borderRadius: 3,
            background: XP_BG,
            boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
            padding: '4px 3px',
          }}>
            {/* Tools in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {TOOLS.flat().map(({ id, hint, render }) => (
                <button
                  key={id}
                  title={hint}
                  style={toolBtnStyle(id)}
                  onClick={() => setActiveTool(id)}
                  onMouseEnter={() => setStatusText(hint)}
                  onMouseLeave={() => setStatusText('For Help, click Help Topics on the Help Menu.')}
                >
                  {render(activeTool === id)}
                </button>
              ))}
            </div>
          </div>

          {/* Options Box */}
          <div style={{
            border: '1px solid #ACA899',
            borderRadius: 3,
            background: XP_BG,
            boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
            padding: 6,
            minHeight: 60,
          }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>Options</div>
            
            {/* Brush Size Options */}
            {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'airbrush') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(size => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 14,
                      padding: 0,
                      border: brushSize === size ? '1px solid #7F9EDA' : '1px solid transparent',
                      background: brushSize === size ? '#E3E0D1' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: size * 2 + 3,
                      height: size * 2 + 3,
                      borderRadius: '50%',
                      background: '#000',
                    }} />
                  </button>
                ))}
              </div>
            )}

            {/* Shape Fill Option */}
            {(activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'polygon' || activeTool === 'roundRect') && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                fontSize: 10,
                cursor: 'pointer',
              }}>
                <input 
                  type="checkbox" 
                  checked={fillShapes}
                  onChange={e => setFillShapes(e.target.checked)}
                />
                Fill
              </label>
            )}

            {/* Empty Options for other tools */}
            {!['brush', 'eraser', 'airbrush', 'rect', 'ellipse', 'polygon', 'roundRect'].includes(activeTool) && (
              <div style={{ color: '#999', fontSize: 9, textAlign: 'center', paddingTop: 10 }}>
                No options
              </div>
            )}
          </div>
        </div>

        {/* ===== CANVAS AREA ===== */}
        <div 
          style={{ 
            flex: 1, 
            background: '#7F9EDA',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={() => setActiveMenu(null)}
        >
          {/* Canvas with Scrollbars */}
          <div style={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            overflow: 'hidden',
          }}>
            {/* Canvas Container */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              {/* Canvas with Shadow border */}
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
                    cursor: 'crosshair',
                    display: 'block',
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onContextMenu={e => e.preventDefault()}
                />
              </div>
            </div>

            {/* Vertical Scrollbar */}
            <div style={{
              width: 16,
              background: '#F0EFE2',
              borderLeft: '1px solid #ACA899',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <XpScrollButton>▲</XpScrollButton>
              <div style={{ flex: 1, position: 'relative', background: '#E8E5D8' }}>
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: 2,
                  right: 2,
                  height: 50,
                  background: '#E0DDD0',
                  border: '1px solid #908D85',
                  boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
                }} />
              </div>
              <XpScrollButton>▼</XpScrollButton>
            </div>
          </div>

          {/* Horizontal Scrollbar */}
          <div style={{
            height: 16,
            background: '#F0EFE2',
            borderTop: '1px solid #ACA899',
            display: 'flex',
            alignItems: 'center',
          }}>
            <XpScrollButton>◀</XpScrollButton>
            <div style={{ flex: 1, position: 'relative', height: '100%', background: '#E8E5D8' }}>
              <div style={{
                position: 'absolute',
                left: '10%',
                top: 2,
                bottom: 2,
                width: 80,
                background: '#E0DDD0',
                border: '1px solid #908D85',
                boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
              }} />
            </div>
            <XpScrollButton>▶</XpScrollButton>
            <div style={{ 
              width: 16, 
              height: 16, 
              background: '#ECE9D8', 
              borderLeft: '1px solid #ACA899',
              boxShadow: 'inset 1px 1px 0 #FFFFFF',
            }} />
          </div>
        </div>
      </div>

      {/* ===== COLOR PALETTE (Bottom) ===== */}
      <div style={{
        height: 46,
        background: XP_BG,
        borderTop: '1px solid #ACA899',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 8,
      }}>
        {/* Color Preview Box */}
        <div style={{
          width: 40,
          height: 34,
          border: '1px solid #ACA899',
          boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
          position: 'relative',
          background: '#FFFFFF',
          flexShrink: 0,
        }}>
          {/* Background color (larger, behind) */}
          <div 
            style={{
              position: 'absolute',
              right: 3,
              bottom: 3,
              width: 18,
              height: 18,
              background: bgColor,
              border: '1px solid #000',
              cursor: 'pointer',
            }}
            title="Background Color (right click)"
            onContextMenu={e => e.preventDefault()}
          />
          {/* Foreground color (smaller, in front) */}
          <div 
            style={{
              position: 'absolute',
              left: 3,
              top: 3,
              width: 16,
              height: 16,
              background: fgColor,
              border: '1px solid #000',
              cursor: 'pointer',
            }}
            title="Foreground Color (left click)"
          />
        </div>

        {/* Color Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(28, 14px)',
          gap: 0,
          flex: 1,
        }}>
          {COLOR_PALETTE.map((color, i) => (
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
            />
          ))}
        </div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div style={{
        height: 20,
        background: XP_BG,
        borderTop: '1px solid #ACA899',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        fontSize: 11,
      }}>
        <div style={{ flex: 1 }}>
          {statusText}
        </div>
        <div style={{ 
          borderLeft: '1px solid #ACA899', 
          padding: '0 8px',
          minWidth: 80,
          textAlign: 'right',
        }}>
          {currentPos.x}, {currentPos.y}px
        </div>
      </div>
    </div>
  )
}

// ===== Subcomponents =====
const floatRight: React.CSSProperties = { float: 'right', marginLeft: 20 }

function XpScrollButton({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      width: 16,
      height: 16,
      padding: 0,
      border: 'none',
      background: '#ECE9D8',
      cursor: 'pointer',
      fontSize: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
    }}>
      {children}
    </button>
  )
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '3px 8px',
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
      margin: '3px 2px',
    }} />
  )
}
