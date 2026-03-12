'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const W = 500
const H = 680
const BALL_R = 9
const GX = 0
const GY = 0.35
const BUMPER_R = 22

interface Vec { x: number; y: number }
interface Ball { x: number; y: number; vx: number; vy: number; active: boolean }
interface Bumper { x: number; y: number; r: number; lit: boolean; litTimer: number; points: number }
interface Flipper { cx: number; cy: number; len: number; angle: number; targetAngle: number; dir: 1 | -1 }

const BUMPERS: Bumper[] = [
  { x: 160, y: 200, r: BUMPER_R, lit: false, litTimer: 0, points: 100 },
  { x: 280, y: 190, r: BUMPER_R, lit: false, litTimer: 0, points: 100 },
  { x: 220, y: 265, r: BUMPER_R, lit: false, litTimer: 0, points: 500 },
  { x: 140, y: 310, r: BUMPER_R, lit: false, litTimer: 0, points: 100 },
  { x: 310, y: 290, r: BUMPER_R, lit: false, litTimer: 0, points: 100 },
]

const LEFT_FLIPPER: Flipper = { cx: 140, cy: 590, len: 65, angle: 0.6, targetAngle: 0.6, dir: 1 }
const RIGHT_FLIPPER: Flipper = { cx: 310, cy: 590, len: 65, angle: Math.PI - 0.6, targetAngle: Math.PI - 0.6, dir: -1 }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function reflectVelocity(vx: number, vy: number, nx: number, ny: number, restitution = 1.6) {
  const dot = vx * nx + vy * ny
  return { vx: vx - restitution * dot * nx, vy: vy - restitution * dot * ny }
}

export default function SpaceCadetApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    ball: { x: 460, y: 500, vx: 0, vy: 0, active: false } as Ball,
    bumpers: BUMPERS.map(b => ({ ...b })),
    leftFlipper: { ...LEFT_FLIPPER },
    rightFlipper: { ...RIGHT_FLIPPER },
    score: 0,
    balls: 3,
    plungerPower: 0,
    plungerCharging: false,
    gameOver: false,
    paused: false,
    multiplier: 1,
    multiTimer: 0,
  })
  const keysRef = useRef<Set<string>>(new Set())
  const animRef = useRef<number>()
  const [displayScore, setDisplayScore] = useState(0)
  const [displayBalls, setDisplayBalls] = useState(3)
  const [displayOver, setDisplayOver] = useState(false)
  const [displayPlunger, setDisplayPlunger] = useState(0)

  const resetBall = useCallback(() => {
    const s = stateRef.current
    s.ball = { x: 460, y: 520, vx: 0, vy: 0, active: false }
    s.plungerPower = 0
    s.plungerCharging = false
  }, [])

  function startGame() {
    const s = stateRef.current
    s.score = 0
    s.balls = 3
    s.gameOver = false
    s.bumpers = BUMPERS.map(b => ({ ...b }))
    s.multiplier = 1
    resetBall()
    setDisplayScore(0)
    setDisplayBalls(3)
    setDisplayOver(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    function onKey(e: KeyboardEvent, down: boolean) {
      keysRef.current[down ? 'add' : 'delete'](e.code)
      if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') e.preventDefault()
    }
    window.addEventListener('keydown', e => onKey(e, true))
    window.addEventListener('keyup', e => onKey(e, false))

    function drawTable() {
      const s = stateRef.current
      const keys = keysRef.current

      // Draw background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0A0A2A')
      bg.addColorStop(0.3, '#0A1A4A')
      bg.addColorStop(1, '#050515')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Draw lanes / rail
      ctx.strokeStyle = '#1A3A8A'
      ctx.lineWidth = 3
      // Left wall
      ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(60, 550); ctx.stroke()
      // Right wall
      ctx.beginPath(); ctx.moveTo(W - 60, 0); ctx.lineTo(W - 60, 550); ctx.stroke()
      // Plunger lane (right side)
      ctx.strokeStyle = '#2A4A9A'
      ctx.beginPath(); ctx.moveTo(W - 55, 0); ctx.lineTo(W - 55, 580); ctx.stroke()

      // Stars decoration
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      [[80, 80], [120, 150], [200, 100], [350, 80], [400, 120], [100, 400], [380, 350]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill()
      })

      // Planet decoration
      const planet = ctx.createRadialGradient(390, 140, 5, 390, 140, 30)
      planet.addColorStop(0, '#FF6030')
      planet.addColorStop(1, '#802010')
      ctx.fillStyle = planet
      ctx.beginPath(); ctx.arc(390, 140, 30, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#FF8050'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.ellipse(390, 140, 42, 10, 0.3, 0, Math.PI * 2); ctx.stroke()

      // Score display
      ctx.fillStyle = '#000A1A'
      ctx.fillRect(60, 10, W - 120, 40)
      ctx.strokeStyle = '#0A3A7A'; ctx.lineWidth = 1
      ctx.strokeRect(60, 10, W - 120, 40)
      ctx.font = 'bold 22px "Courier New"'
      ctx.fillStyle = '#00FF88'
      ctx.textAlign = 'center'
      ctx.fillText(String(s.score).padStart(8, '0'), W / 2, 36)
      ctx.font = '10px "Courier New"'
      ctx.fillStyle = '#0088AA'
      ctx.fillText(`BÄLLE: ${s.balls}  ×${s.multiplier}`, W / 2, 58)

      // Bumpers
      s.bumpers.forEach(b => {
        const g = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, b.r)
        if (b.lit) {
          g.addColorStop(0, '#FFFFFF')
          g.addColorStop(0.3, '#FFFF00')
          g.addColorStop(1, '#FF8800')
        } else {
          g.addColorStop(0, '#3A8AFF')
          g.addColorStop(1, '#0A2A8A')
        }
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = b.lit ? '#FFFF00' : '#5AABFF'; ctx.lineWidth = 2
        ctx.stroke()
        ctx.font = 'bold 10px "Courier New"'
        ctx.fillStyle = b.lit ? '#000' : '#AAF'
        ctx.textAlign = 'center'
        ctx.fillText(String(b.points), b.x, b.y + 4)
        if (b.lit) b.litTimer--
        if (b.litTimer <= 0) b.lit = false
      })

      // Draw flippers
      function drawFlipper(f: Flipper) {
        const ex = f.cx + Math.cos(f.angle) * f.len
        const ey = f.cy + Math.sin(f.angle) * f.len
        const grad = ctx.createLinearGradient(f.cx, f.cy, ex, ey)
        grad.addColorStop(0, '#8AD8FF')
        grad.addColorStop(1, '#1A5A8A')
        ctx.strokeStyle = grad
        ctx.lineWidth = 14
        ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(f.cx, f.cy); ctx.lineTo(ex, ey); ctx.stroke()
        ctx.strokeStyle = '#AAEEFF'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(f.cx, f.cy); ctx.lineTo(ex, ey); ctx.stroke()
      }
      drawFlipper(s.leftFlipper)
      drawFlipper(s.rightFlipper)

      // Slings (bumper cushions near flippers)
      ctx.strokeStyle = '#0A4A8A'; ctx.lineWidth = 6; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(60, 450); ctx.lineTo(120, 540); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W - 60, 450); ctx.lineTo(W - 120, 540); ctx.stroke()

      // Plunger
      const plungerX = W - 30
      ctx.fillStyle = '#555'; ctx.fillRect(plungerX - 6, 550, 12, 120)
      ctx.fillStyle = `rgb(${Math.round(100 + 155 * s.plungerPower / 100)}, ${Math.round(200 - 150 * s.plungerPower / 100)}, 50)`
      const ph = 30 + s.plungerPower * 0.8
      ctx.fillRect(plungerX - 8, 670 - ph, 16, ph)
      ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(plungerX, 680, 10, 0, Math.PI * 2); ctx.fill()

      // Ball
      if (s.ball.active || !s.gameOver) {
        const bg2 = ctx.createRadialGradient(s.ball.x - 3, s.ball.y - 3, 1, s.ball.x, s.ball.y, BALL_R)
        bg2.addColorStop(0, '#FFFFFF')
        bg2.addColorStop(0.4, '#DDDDDD')
        bg2.addColorStop(1, '#888888')
        ctx.fillStyle = bg2
        ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()
      }

      // Game over overlay
      if (s.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(0, 0, W, H)
        ctx.font = 'bold 36px "Courier New"'
        ctx.fillStyle = '#FF4444'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 30)
        ctx.font = 'bold 18px "Courier New"'
        ctx.fillStyle = '#00FF88'
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 10)
        ctx.font = '14px "Courier New"'
        ctx.fillStyle = '#AAAAFF'
        ctx.fillText('Drücke ENTER zum Neustart', W / 2, H / 2 + 50)
      }

      if (!s.ball.active && !s.gameOver) {
        ctx.font = '12px "Courier New"'
        ctx.fillStyle = '#AAAAFF'
        ctx.textAlign = 'center'
        ctx.fillText('LEERTASTE gedrückt halten → loslassen', W / 2, 500)
      }
    }

    function update() {
      const s = stateRef.current
      const keys = keysRef.current

      if (s.gameOver) {
        if (keys.has('Enter')) startGame()
        return
      }

      // Flipper controls
      const lFlipUp = keys.has('ShiftLeft') || keys.has('KeyZ') || keys.has('ArrowLeft')
      const rFlipUp = keys.has('ShiftRight') || keys.has('Slash') || keys.has('ArrowRight')
      s.leftFlipper.targetAngle = lFlipUp ? -0.5 : 0.6
      s.rightFlipper.targetAngle = rFlipUp ? Math.PI + 0.5 : Math.PI - 0.6
      s.leftFlipper.angle = lerp(s.leftFlipper.angle, s.leftFlipper.targetAngle, 0.35)
      s.rightFlipper.angle = lerp(s.rightFlipper.angle, s.rightFlipper.targetAngle, 0.35)

      // Plunger
      if (!s.ball.active) {
        if (keys.has('Space')) {
          s.plungerCharging = true
          s.plungerPower = Math.min(100, s.plungerPower + 2.5)
        } else if (s.plungerCharging) {
          // Launch
          s.ball.active = true
          s.ball.x = W - 30
          s.ball.y = 520
          s.ball.vx = -1
          s.ball.vy = -(s.plungerPower * 0.18 + 4)
          s.plungerCharging = false
          s.plungerPower = 0
        }
        setDisplayPlunger(Math.round(s.plungerPower))
      }

      if (!s.ball.active) return

      // Physics
      s.ball.vx += GX
      s.ball.vy += GY
      // Damping
      s.ball.vx *= 0.999
      s.ball.vy *= 0.999
      // Speed cap
      const spd = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2)
      if (spd > 18) { s.ball.vx = s.ball.vx / spd * 18; s.ball.vy = s.ball.vy / spd * 18 }

      s.ball.x += s.ball.vx
      s.ball.y += s.ball.vy

      // Wall collisions
      if (s.ball.x - BALL_R < 60) { s.ball.x = 60 + BALL_R; s.ball.vx = Math.abs(s.ball.vx) * 0.8 }
      if (s.ball.x + BALL_R > W - 60) {
        // Check if in plunger lane
        if (s.ball.y > 400) { s.ball.x = W - 60 - BALL_R; s.ball.vx = -Math.abs(s.ball.vx) * 0.8 }
        else { s.ball.x = W - 60 - BALL_R; s.ball.vx = -Math.abs(s.ball.vx) * 0.8 }
      }
      if (s.ball.y - BALL_R < 60) { s.ball.y = 60 + BALL_R; s.ball.vy = Math.abs(s.ball.vy) * 0.8 }

      // Sling bumpers (angled walls)
      // Left sling: line from (60,450) to (120,540)
      const slings = [
        { x1: 60, y1: 450, x2: 120, y2: 540 },
        { x1: W - 60, y1: 450, x2: W - 120, y2: 540 },
      ]
      for (const sl of slings) {
        const dx = sl.x2 - sl.x1, dy = sl.y2 - sl.y1
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = -dy / len, ny = dx / len
        const t = ((s.ball.x - sl.x1) * dx + (s.ball.y - sl.y1) * dy) / (len * len)
        if (t >= 0 && t <= 1) {
          const px = sl.x1 + t * dx, py = sl.y1 + t * dy
          const d = dist(s.ball.x, s.ball.y, px, py)
          if (d < BALL_R + 3) {
            const side = (s.ball.x - sl.x1) * (-dy) + (s.ball.y - sl.y1) * dx
            const sn = side > 0 ? 1 : -1
            s.ball.x = px + sn * nx * (BALL_R + 4)
            s.ball.y = py + sn * ny * (BALL_R + 4)
            const r = reflectVelocity(s.ball.vx, s.ball.vy, sn * nx, sn * ny, 1.4)
            s.ball.vx = r.vx; s.ball.vy = r.vy
            s.score += 50 * s.multiplier
          }
        }
      }

      // Bumper collisions
      for (const b of s.bumpers) {
        const d = dist(s.ball.x, s.ball.y, b.x, b.y)
        if (d < BALL_R + b.r) {
          const nx = (s.ball.x - b.x) / d
          const ny = (s.ball.y - b.y) / d
          s.ball.x = b.x + nx * (BALL_R + b.r + 1)
          s.ball.y = b.y + ny * (BALL_R + b.r + 1)
          const r = reflectVelocity(s.ball.vx, s.ball.vy, nx, ny, 1.8)
          s.ball.vx = r.vx; s.ball.vy = r.vy
          b.lit = true; b.litTimer = 12
          const pts = b.points * s.multiplier
          s.score += pts
          if (s.score > 0 && s.score % 5000 < pts) s.multiplier = Math.min(8, s.multiplier + 1)
        }
      }

      // Flipper collisions
      function checkFlipper(f: Flipper) {
        const ex = f.cx + Math.cos(f.angle) * f.len
        const ey = f.cy + Math.sin(f.angle) * f.len
        const dx = ex - f.cx, dy = ey - f.cy
        const len2 = f.len
        const t = Math.max(0, Math.min(1, ((s.ball.x - f.cx) * dx + (s.ball.y - f.cy) * dy) / (len2 * len2)))
        const px = f.cx + t * dx, py = f.cy + t * dy
        const d = dist(s.ball.x, s.ball.y, px, py)
        if (d < BALL_R + 7) {
          const nx = (s.ball.x - px) / d
          const ny = (s.ball.y - py) / d
          s.ball.x = px + nx * (BALL_R + 8)
          s.ball.y = py + ny * (BALL_R + 8)
          const flipperVel = f.angle - f.targetAngle
          const r = reflectVelocity(s.ball.vx, s.ball.vy, nx, ny, 1.5)
          s.ball.vx = r.vx + nx * Math.abs(flipperVel) * 8
          s.ball.vy = r.vy + ny * Math.abs(flipperVel) * 8 - 3
        }
      }
      checkFlipper(s.leftFlipper)
      checkFlipper(s.rightFlipper)

      // Ball lost
      if (s.ball.y > H + 20) {
        s.balls--
        s.ball.active = false
        s.multiplier = 1
        if (s.balls <= 0) {
          s.gameOver = true
          setDisplayOver(true)
        }
        setDisplayBalls(s.balls)
        resetBall()
      }

      setDisplayScore(s.score)
    }

    function loop() {
      update()
      ctx.clearRect(0, 0, W, H)
      drawTable()
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animRef.current!)
      window.removeEventListener('keydown', e => onKey(e, true))
      window.removeEventListener('keyup', e => onKey(e, false))
    }
  }, [])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000A1A', fontFamily: '"Courier New", monospace' }}>
      {/* Top bar */}
      <div className="xp-menubar" style={{ background: '#0A1A3A', borderBottom: '1px solid #0A3A6A' }}>
        {['Spiel', 'Optionen', 'Hilfe'].map(m => (
          <span key={m} className="xp-menu-item" style={{ color: '#AAF' }}>{m}</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', paddingRight: 8 }}>
          <span style={{ color: '#00FF88', fontSize: 11 }}>Score: {String(displayScore).padStart(8, '0')}</span>
          <span style={{ color: '#FFCC00', fontSize: 11 }}>Bälle: {'●'.repeat(displayBalls)}{'○'.repeat(Math.max(0, 3 - displayBalls))}</span>
        </div>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 8 }}>
        {/* Controls info */}
        <div style={{ color: '#3A6AAA', fontSize: 10, width: 120, flexShrink: 0 }}>
          <div style={{ marginBottom: 8, color: '#5A9ADA', fontWeight: 'bold' }}>STEUERUNG</div>
          <div>← ↑ → Flipper</div>
          <div>Shift L/R</div>
          <div style={{ marginTop: 8 }}>LEERTASTE</div>
          <div>Plunger laden</div>
          <div style={{ marginTop: 8 }}>Z = Links</div>
          <div>/ = Rechts</div>
          {displayPlunger > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: '#FFCC00' }}>Kraft: {displayPlunger}%</div>
              <div style={{ width: '100%', height: 8, background: '#333', borderRadius: 4, marginTop: 3 }}>
                <div style={{ height: '100%', width: `${displayPlunger}%`, background: `hsl(${120 - displayPlunger * 1.2}, 100%, 50%)`, borderRadius: 4, transition: 'width 0.1s' }} />
              </div>
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ border: '3px solid #0A3A6A', boxShadow: '0 0 30px #0A4AAA55', flexShrink: 0 }}
          tabIndex={0}
          onFocus={() => canvasRef.current?.focus()}
        />

        <div style={{ color: '#3A6AAA', fontSize: 10, width: 120, flexShrink: 0 }}>
          <div style={{ marginBottom: 8, color: '#5A9ADA', fontWeight: 'bold' }}>PUNKTE</div>
          <div>Bumper: 100</div>
          <div>Sling: 50</div>
          <div style={{ marginTop: 8, color: '#FFCC00' }}>MULTIPLIKATOR</div>
          <div style={{ color: '#00FF88' }}>×{stateRef.current.multiplier}</div>
          <div style={{ fontSize: 9, color: '#555', marginTop: 4 }}>je 5000 Pkt +1×</div>
          <button
            onClick={startGame}
            className="xp-btn"
            style={{ marginTop: 20, fontSize: 10, width: '100%', background: '#0A2A5A', color: '#AAF', borderColor: '#0A4A8A' }}
          >
            Neu starten
          </button>
        </div>
      </div>
    </div>
  )
}
