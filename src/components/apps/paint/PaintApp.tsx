'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ===== Types =====
type Tool = 
  | 'freeSelect' | 'select' | 'eraser' | 'fill' | 'pickColor' | 'magnifier'
  | 'pencil' | 'brush' | 'airbrush' | 'text' | 'line' | 'curve'
  | 'rect' | 'polygon' | 'ellipse' | 'roundRect'

interface Point { x: number; y: number }

// ===== Tools in EXAKT der gewünschten Reihenfolge =====
// Links: Lasso, Radiergummi, Pipette, Bleistift, Spraydose, Strich, Rechteck, Ellipse
// Rechts: Rechteck-Auswahl, Eimer, Lupe, Pinsel, Text, Gekrümmte Linie, Vieleck, Abgerundetes Rechteck
const TOOLS_LEFT: { id: Tool; hint: string }[] = [
  { id: 'freeSelect', hint: 'Free-form Select' },
  { id: 'eraser', hint: 'Eraser/Color Eraser' },
  { id: 'pickColor', hint: 'Pick Color' },
  { id: 'pencil', hint: 'Pencil' },
  { id: 'airbrush', hint: 'Airbrush' },
  { id: 'line', hint: 'Line' },
  { id: 'rect', hint: 'Rectangle' },
  { id: 'ellipse', hint: 'Ellipse' },
]

const TOOLS_RIGHT: { id: Tool; hint: string }[] = [
  { id: 'select', hint: 'Select' },
  { id: 'fill', hint: 'Fill With Color' },
  { id: 'magnifier', hint: 'Magnifier' },
  { id: 'brush', hint: 'Brush' },
  { id: 'text', hint: 'Text' },
  { id: 'curve', hint: 'Curve' },
  { id: 'polygon', hint: 'Polygon' },
  { id: 'roundRect', hint: 'Rounded Rectangle' },
]

// Tool Icons als Unicode/ASCII Symbole
const ToolIcon = ({ tool, active }: { tool: Tool; active: boolean }) => {
  const icons: Record<Tool, string> = {
    freeSelect: '✦',     // Stern/Lasso
    select: '▭',         // Rechteck (Auswahl)
    eraser: '▭',         // Radiergummi
    fill: '▼',           // Eimer
    pickColor: '⚲',      // Pipette
    magnifier: '⚲',      // Lupe
    pencil: '✎',         // Bleistift
    brush: '✐',          // Pinsel
    airbrush: '⌼',       // Spraydose
    text: 'A',           // Text
    line: '╱',           // Strich
    curve: '∿',          // Gekrümmte Linie
    rect: '▭',           // Rechteck
    polygon: '⬠',        // Vieleck
    ellipse: '⬭',        // Ellipse
    roundRect: '▢',      // Abgerundetes Rechteck
  }
  return <span style={{ fontSize: tool === 'text' ? 13 : 11, fontWeight: tool === 'text' ? 'bold' : 'normal', fontFamily: tool === 'text' ? 'Times, serif' : 'inherit' }}>{icons[tool]}</span>
}

// ===== Farbpalette: 2 Zeilen mit jeweils 14 Farben =====
const COLOR_PALETTE_ROW1 = [
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200',
  '#22B14C', '#00A2E8', '#3F48CC', '#A349A4', '#FFFFFF', '#C3C3C3',
  '#B97A57', '#FFAEC9',
]
const COLOR_PALETTE_ROW2 = [
  '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7',
  '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8',
  '#3F48CC', '#A349A4',
]

// XP Style Colors
const XP_BG = '#ECE9D8'

export default function PaintApp() {
  // ===== State =====
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
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
  
  // Scrollbar State
  const [scrollX, setScrollX] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [maxScroll, setMaxScroll] = useState({ x: 200, y: 200 })

  // ===== Canvas Functions =====
  const getCanvasCoordinates = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.floor(e.clientX - rect.left + scrollX),
      y: Math.floor(e.clientY - rect.top + scrollY)
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

  // ===== Scrollbar Functions =====
  const handleVScroll = (direction: 'up' | 'down') => {
    setScrollY(prev => {
      const newVal = direction === 'up' ? Math.max(0, prev - 20) : Math.min(maxScroll.y, prev + 20)
      return newVal
    })
  }

  const handleHScroll = (direction: 'left' | 'right') => {
    setScrollX(prev => {
      const newVal = direction === 'left' ? Math.max(0, prev - 20) : Math.min(maxScroll.x, prev + 20)
      return newVal
    })
  }

  const handleScrollDrag = (axis: 'x' | 'y', e: React.MouseEvent) => {
    const startPos = axis === 'x' ? e.clientX : e.clientY
    const startScroll = axis === 'x' ? scrollX : scrollY
    
    const handleMove = (moveEvent: MouseEvent) => {
      const currentPos = axis === 'x' ? moveEvent.clientX : moveEvent.clientY
      const delta = currentPos - startPos
      const max = axis === 'x' ? maxScroll.x : maxScroll.y
      const trackSize = axis === 'x' ? 200 : 150 // approximate
      const newScroll = Math.max(0, Math.min(max, startScroll + (delta * max / trackSize)))
      
      if (axis === 'x') setScrollX(newScroll)
      else setScrollY(newScroll)
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
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

  // Scrollbar thumb positions
  const vThumbPos = maxScroll.y > 0 ? (scrollY / maxScroll.y) * 100 : 0
  const hThumbPos = maxScroll.x > 0 ? (scrollX / maxScroll.x) * 100 : 0

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
        
        {/* ===== LEFT SIDEBAR ===== */}
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
            {/* Tools in 2 Spalten */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {TOOLS_LEFT.map((tool, i) => (
                <button
                  key={tool.id}
                  title={tool.hint}
                  style={toolBtnStyle(tool.id)}
                  onClick={() => setActiveTool(tool.id)}
                  onMouseEnter={() => setStatusText(tool.hint)}
                  onMouseLeave={() => setStatusText('For Help, click Help Topics on the Help Menu.')}
                >
                  <ToolIcon tool={tool.id} active={activeTool === tool.id} />
                </button>
              ))}
              {TOOLS_RIGHT.map((tool, i) => (
                <button
                  key={tool.id}
                  title={tool.hint}
                  style={toolBtnStyle(tool.id)}
                  onClick={() => setActiveTool(tool.id)}
                  onMouseEnter={() => setStatusText(tool.hint)}
                  onMouseLeave={() => setStatusText('For Help, click Help Topics on the Help Menu.')}
                >
                  <ToolIcon tool={tool.id} active={activeTool === tool.id} />
                </button>
              ))}
            </div>
          </div>

          {/* Options Box - nur Rahmen, kein Text */}
          <div style={{
            border: '1px solid #ACA899',
            borderRadius: 3,
            background: XP_BG,
            boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
            padding: 6,
            minHeight: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Options Inhalt nur wenn Tool Optionen hat */}
            {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'airbrush') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
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
            {/* Canvas Container - mit Scroll-Overflow */}
            <div 
              ref={canvasContainerRef}
              style={{ 
                flex: 1, 
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Scrollbarer Canvas-Wrapper */}
              <div style={{
                position: 'absolute',
                left: 20 - scrollX,
                top: 20 - scrollY,
                minWidth: '100%',
                minHeight: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: 20,
              }}>
                {/* Canvas mit Shadow border */}
                <div style={{
                  background: '#808080',
                  padding: 2,
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flexShrink: 0,
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
            </div>

            {/* Vertical Scrollbar */}
            <div style={{
              width: 16,
              background: '#F0EFE2',
              borderLeft: '1px solid #ACA899',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <XpScrollButton onClick={() => handleVScroll('up')}>▲</XpScrollButton>
              <div style={{ flex: 1, position: 'relative', background: '#E8E5D8' }}>
                <div 
                  style={{
                    position: 'absolute',
                    top: `${10 + vThumbPos * 0.6}%`,
                    left: 2,
                    right: 2,
                    height: 40,
                    background: '#E0DDD0',
                    border: '1px solid #908D85',
                    boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
                    cursor: 'pointer',
                  }}
                  onMouseDown={(e) => handleScrollDrag('y', e)}
                />
              </div>
              <XpScrollButton onClick={() => handleVScroll('down')}>▼</XpScrollButton>
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
            <XpScrollButton onClick={() => handleHScroll('left')}>◀</XpScrollButton>
            <div style={{ flex: 1, position: 'relative', height: '100%', background: '#E8E5D8' }}>
              <div 
                style={{
                  position: 'absolute',
                  left: `${5 + hThumbPos * 0.7}%`,
                  top: 2,
                  bottom: 2,
                  width: 60,
                  background: '#E0DDD0',
                  border: '1px solid #908D85',
                  boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #716F64',
                  cursor: 'pointer',
                }}
                onMouseDown={(e) => handleScrollDrag('x', e)}
              />
            </div>
            <XpScrollButton onClick={() => handleHScroll('right')}>▶</XpScrollButton>
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

      {/* ===== COLOR PALETTE (2 Zeilen mit je 14 Farben) ===== */}
      <div style={{
        background: XP_BG,
        borderTop: '1px solid #ACA899',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
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

        {/* Color Grid - 2 Zeilen */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
        }}>
          {/* Zeile 1 */}
          <div style={{ display: 'flex', gap: 0 }}>
            {COLOR_PALETTE_ROW1.map((color, i) => (
              <button
                key={`r1-${i}`}
                onClick={e => {
                  if (e.button === 2 || e.ctrlKey) setBgColor(color)
                  else setFgColor(color)
                }}
                onContextMenu={e => {
                  e.preventDefault()
                  setBgColor(color)
                }}
                style={{
                  width: 16,
                  height: 16,
                  padding: 0,
                  border: '1px solid #ACA899',
                  background: color,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          {/* Zeile 2 */}
          <div style={{ display: 'flex', gap: 0 }}>
            {COLOR_PALETTE_ROW2.map((color, i) => (
              <button
                key={`r2-${i}`}
                onClick={e => {
                  if (e.button === 2 || e.ctrlKey) setBgColor(color)
                  else setFgColor(color)
                }}
                onContextMenu={e => {
                  e.preventDefault()
                  setBgColor(color)
                }}
                style={{
                  width: 16,
                  height: 16,
                  padding: 0,
                  border: '1px solid #ACA899',
                  background: color,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
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

function XpScrollButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{
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
      }}
    >
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
