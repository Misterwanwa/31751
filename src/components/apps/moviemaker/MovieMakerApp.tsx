'use client'
import { useState, useRef } from 'react'

interface Clip {
  id: string
  name: string
  duration: string
  icon: string
  type: 'video' | 'audio' | 'image'
  thumbnail: string
}

const SAMPLE_CLIPS: Clip[] = [
  { id: '1', name: 'Urlaub_Sommer.avi', duration: '0:45', icon: '🎬', type: 'video', thumbnail: '🌅' },
  { id: '2', name: 'Geburtstag_Party.wmv', duration: '1:23', icon: '🎬', type: 'video', thumbnail: '🎂' },
  { id: '3', name: 'Strandzenen.avi', duration: '0:30', icon: '🎬', type: 'video', thumbnail: '🏖️' },
  { id: '4', name: 'Hintergrundmusik.mp3', duration: '3:45', icon: '🎵', type: 'audio', thumbnail: '🎵' },
  { id: '5', name: 'Intro_Bild.jpg', duration: '—', icon: '🖼️', type: 'image', thumbnail: '🖼️' },
  { id: '6', name: 'Abspann.jpg', duration: '—', icon: '🖼️', type: 'image', thumbnail: '🌟' },
]

const TRANSITIONS = ['Überblenden', 'Wischen (links)', 'Wischen (rechts)', 'Zoomen', 'Drehen', 'Würfel', 'Keine']
const EFFECTS = ['Alterungsfilm', 'Schwarzweiß', 'Heller', 'Dunkler', 'Verblassen', 'Spiegeln', 'Pixelieren']

export default function MovieMakerApp() {
  const [timeline, setTimeline] = useState<Clip[]>([])
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [view, setView] = useState<'storyboard' | 'timeline'>('storyboard')
  const [selectedTask, setSelectedTask] = useState('import')

  function addToTimeline(clip: Clip) {
    setTimeline(prev => [...prev, { ...clip, id: `tl-${Date.now()}` }])
  }

  function removeFromTimeline(id: string) {
    setTimeline(prev => prev.filter(c => c.id !== id))
    if (selectedClip === id) setSelectedClip(null)
  }

  const totalDuration = timeline
    .filter(c => c.type !== 'image')
    .reduce((sum, c) => {
      const [m, s] = c.duration.split(':').map(Number)
      return sum + m * 60 + s
    }, 0)

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: '#ECE9D8' }}>
      {/* Menu */}
      <div className="xp-menubar">
        {['Datei', 'Bearbeiten', 'Ansicht', 'Extras', 'Clip', 'Wiedergabe', 'Hilfe'].map(m => (
          <span key={m} className="xp-menu-item">{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="xp-toolbar">
        <button className="xp-btn">📂 Importieren</button>
        <div className="xp-separator" />
        <button className="xp-btn" disabled={timeline.length === 0}>💾 Film speichern</button>
        <button className="xp-btn" disabled={timeline.length === 0}>📤 Veröffentlichen</button>
        <div className="xp-separator" />
        <button className={`xp-btn${view === 'storyboard' ? ' xp-btn-primary' : ''}`} onClick={() => setView('storyboard')}>
          🎞️ Storyboard
        </button>
        <button className={`xp-btn${view === 'timeline' ? ' xp-btn-primary' : ''}`} onClick={() => setView('timeline')}>
          📊 Zeitachse
        </button>
      </div>

      {/* Main: 3-pane layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Task pane */}
        <div style={{ width: 170, borderRight: '1px solid #ACA899', overflow: 'auto', background: '#F0F0E8', flexShrink: 0 }}>
          {/* Movie Tasks */}
          <div style={{ background: '#1B5FA8', color: 'white', padding: '6px 8px', fontWeight: 'bold', fontSize: 11 }}>
            Film-Aufgaben
          </div>
          {[
            { key: 'import', label: '📥 Video aufnehmen', desc: 'Vom Gerät importieren' },
            { key: 'import2', label: '📂 Video importieren', desc: 'Von Festplatte' },
            { key: 'edit', label: '✂️ Film bearbeiten', desc: 'Clips anordnen' },
            { key: 'effects', label: '✨ Effekte hinzufügen', desc: 'Übergänge, Titel' },
            { key: 'publish', label: '💾 Film fertigstellen', desc: 'Exportieren' },
          ].map(task => (
            <div
              key={task.key}
              onClick={() => setSelectedTask(task.key)}
              style={{
                padding: '6px 8px',
                background: selectedTask === task.key ? '#316AC5' : 'transparent',
                color: selectedTask === task.key ? 'white' : '#000',
                cursor: 'pointer',
                borderBottom: '1px solid #DDD9C8',
              }}
            >
              <div style={{ fontSize: 11 }}>{task.label}</div>
              <div style={{ fontSize: 9, opacity: 0.7 }}>{task.desc}</div>
            </div>
          ))}
          <div style={{ height: 1, background: '#ACA899', margin: '4px 0' }} />
          <div style={{ background: '#1B5FA8', color: 'white', padding: '6px 8px', fontWeight: 'bold', fontSize: 11 }}>
            Übergänge
          </div>
          {TRANSITIONS.slice(0, 4).map(t => (
            <div key={t} style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #EEE', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EEF4FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              🎞️ {t}
            </div>
          ))}
        </div>

        {/* Center: Clip collection */}
        <div style={{ width: 300, borderRight: '1px solid #ACA899', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '4px 8px', background: '#E8E7DC', borderBottom: '1px solid #ACA899', display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Auflistung:</span>
            <span>Clips</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 4, display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'flex-start', background: 'white' }}>
            {SAMPLE_CLIPS.map(clip => (
              <div
                key={clip.id}
                onDoubleClick={() => addToTimeline(clip)}
                title={`Doppelklick zum Hinzufügen: ${clip.name}`}
                style={{
                  width: 90, padding: 6,
                  background: '#F8F7F0',
                  border: '2px solid #ACA899',
                  borderRadius: 3,
                  cursor: 'default',
                  textAlign: 'center',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#316AC5'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ACA899'}
              >
                <div style={{ fontSize: 32, marginBottom: 4 }}>{clip.thumbnail}</div>
                <div style={{ fontSize: 9, wordBreak: 'break-word', lineHeight: 1.3 }}>{clip.name}</div>
                <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{clip.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Preview window */}
          <div style={{ flex: 1, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: 60, marginBottom: 8 }}>🎬</div>
                <div style={{ fontSize: 12 }}>Fügen Sie Clips zum Storyboard hinzu</div>
                <div style={{ fontSize: 10, marginTop: 4, color: '#555' }}>Doppelklick auf Clip zum Hinzufügen</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 80, marginBottom: 8 }}>
                  {timeline[Math.min(Math.floor(progress * timeline.length / 100), timeline.length - 1)]?.thumbnail || '🎬'}
                </div>
                <div style={{ fontSize: 11, color: '#CCC' }}>
                  {timeline[0]?.name}
                </div>
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div style={{ background: '#333', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#CCC', fontSize: 10 }}>0:00</span>
              <div style={{ flex: 1, height: 8, background: '#555', borderRadius: 4, cursor: 'pointer', position: 'relative' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#316AC5', borderRadius: 4 }} />
              </div>
              <span style={{ color: '#CCC', fontSize: 10 }}>{formatTime(totalDuration)}</span>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              {[
                { icon: '⏮️', label: 'Anfang' },
                { icon: '◀️', label: 'Zurück' },
                { icon: playing ? '⏸️' : '▶️', label: playing ? 'Pause' : 'Abspielen', onClick: () => setPlaying(p => !p) },
                { icon: '▶️', label: 'Vor' },
                { icon: '⏭️', label: 'Ende' },
                { icon: '⏹️', label: 'Stop', onClick: () => { setPlaying(false); setProgress(0) } },
              ].map((btn, i) => (
                <button key={i}
                  onClick={btn.onClick}
                  title={btn.label}
                  style={{
                    background: '#555', border: '1px solid #666', color: 'white',
                    padding: '3px 8px', cursor: 'pointer', borderRadius: 3, fontSize: 14,
                  }}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard / Timeline */}
      <div style={{ height: 130, borderTop: '2px solid #ACA899', background: '#F0EFE6', overflow: 'auto' }}>
        {view === 'storyboard' ? (
          <div style={{ display: 'flex', gap: 4, padding: 8, alignItems: 'center', minWidth: 'max-content' }}>
            {timeline.length === 0 && (
              <div style={{ color: '#888', fontSize: 11, padding: '30px 40px' }}>
                Doppelklicken Sie auf Clips, um sie dem Storyboard hinzuzufügen
              </div>
            )}
            {timeline.map((clip, i) => (
              <div key={clip.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {i > 0 && <div style={{ fontSize: 18, color: '#888' }}>|</div>}
                <div
                  onClick={() => setSelectedClip(clip.id)}
                  style={{
                    width: 90, height: 100, background: 'white',
                    border: `2px solid ${selectedClip === clip.id ? '#316AC5' : '#ACA899'}`,
                    borderRadius: 3, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: 36 }}>{clip.thumbnail}</span>
                  <div style={{ fontSize: 9, textAlign: 'center', padding: '0 4px', lineHeight: 1.2, color: '#555' }}>
                    {clip.name.split('.')[0]}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeFromTimeline(clip.id) }}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      background: '#DC3545', color: 'white', border: 'none',
                      borderRadius: 2, width: 14, height: 14, fontSize: 9, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ width: 60, fontSize: 10, color: '#555' }}>Video</div>
              <div style={{ flex: 1, height: 24, background: '#316AC5', borderRadius: 3, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
                {timeline.map((c, i) => (
                  <div key={i} style={{ height: '100%', background: i % 2 === 0 ? '#4878C0' : '#316AC5', borderRight: '1px solid #5898E8', padding: '2px 4px', fontSize: 9, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {c.name.split('.')[0]}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 2 }}>
              <div style={{ width: 60, fontSize: 10, color: '#555' }}>Audio</div>
              <div style={{ flex: 1, height: 16, background: '#28A745', borderRadius: 3 }}>
                {timeline.filter(c => c.type === 'audio').map((c, i) => (
                  <div key={i} style={{ height: '100%', background: '#28A745', borderRight: '1px solid #3AB855', padding: '1px 4px', fontSize: 9, color: 'white', display: 'inline-block' }}>
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <div className="xp-statusbar-panel">{timeline.length} Clip(s) im Storyboard</div>
        <div className="xp-statusbar-panel">Gesamtdauer: {formatTime(totalDuration)}</div>
        <div style={{ marginLeft: 'auto' }} className="xp-statusbar-panel">Bereit</div>
      </div>
    </div>
  )
}
