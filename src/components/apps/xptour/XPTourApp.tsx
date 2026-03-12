'use client'
import { useState, useEffect } from 'react'

const slides = [
  {
    title: 'Willkommen bei Windows XP',
    subtitle: 'Eine neue Erfahrung wartet auf Sie',
    icon: '🪟',
    bg: '#1B5FA8',
    content: 'Windows XP bietet eine komplett neue visuelle Erfahrung mit dem Luna-Design. Das neue, frische Aussehen macht Ihren Computer angenehmer zu benutzen.',
    features: ['Neues Start-Menü', 'Verbesserte Taskleiste', 'Windows XP-Design'],
  },
  {
    title: 'Der neue Desktop',
    subtitle: 'Ordnung auf Ihren Arbeitsfläche',
    icon: '🖥️',
    bg: '#1B5FA8',
    content: 'Der Windows XP-Desktop wurde von Grund auf überarbeitet. Der Desktop-Assistent hilft Ihnen, Symbole zu organisieren und aufzuräumen.',
    features: ['Desktopbereinigung', 'Schnellstart-Leiste', 'Benachrichtigungsbereich'],
  },
  {
    title: 'Windows Media Player',
    subtitle: 'Musik und Videos genießen',
    icon: '🎵',
    bg: '#0A3A6A',
    content: 'Der neue Windows Media Player 8 bietet eine revolutionäre Oberfläche zum Abspielen von Musik, Videos und zum Kopieren von CDs.',
    features: ['CD-Ripping', 'Medienbibliothek', 'Visualisierungen'],
  },
  {
    title: 'Windows Movie Maker',
    subtitle: 'Ihre eigenen Filme erstellen',
    icon: '🎬',
    bg: '#0A3A6A',
    content: 'Mit Windows Movie Maker können Sie Heimvideos aufnehmen, bearbeiten und als professionelle Filme speichern – ganz einfach!',
    features: ['Video-Import', 'Schnitt & Effekte', 'Film exportieren'],
  },
  {
    title: 'Windows Messenger',
    subtitle: 'Mit Freunden verbunden bleiben',
    icon: '💬',
    bg: '#1B5FA8',
    content: 'Windows Messenger ermöglicht es Ihnen, sofort mit Freunden und Familie zu kommunizieren – mit Text, Sprache oder Video.',
    features: ['Sofortnachrichten', 'Dateiübertragung', 'Video-Chat'],
  },
  {
    title: 'Sicherheit & Updates',
    subtitle: 'Ihr Computer ist geschützt',
    icon: '🛡️',
    bg: '#0A4A1A',
    content: 'Windows XP enthält Windows Update, das Ihren Computer automatisch mit den neuesten Sicherheits-Updates versorgt.',
    features: ['Automatische Updates', 'Windows Firewall', 'Datenverschlüsselung'],
  },
  {
    title: 'Tour beendet!',
    subtitle: 'Viel Spaß mit Windows XP',
    icon: '✨',
    bg: '#1B5FA8',
    content: 'Sie haben die Windows XP-Tour abgeschlossen. Klicken Sie auf "Schließen", um zur Arbeit mit Windows XP zurückzukehren.',
    features: ['Danke für Ihre Zeit!'],
  },
]

export default function XPTourApp() {
  const [slideIdx, setSlideIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(true)

  const slide = slides[slideIdx]

  function goTo(idx: number) {
    setAnimating(true)
    setVisible(false)
    setTimeout(() => {
      setSlideIdx(idx)
      setVisible(true)
      setAnimating(false)
    }, 200)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', overflow: 'hidden' }}>
      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left blue panel */}
        <div style={{
          width: 220,
          background: `linear-gradient(to bottom, ${slide.bg} 0%, #0A2A5A 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px 20px',
          gap: 20,
          transition: 'background 0.5s',
          flexShrink: 0,
        }}>
          {/* XP Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>🪟</div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 'bold', fontStyle: 'italic', letterSpacing: 1 }}>Windows</div>
            <div style={{ color: '#7ABFFF', fontSize: 28, fontWeight: 'bold' }}>XP</div>
          </div>
          {/* Slide icon */}
          <div style={{
            fontSize: 80,
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.3s',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
          }}>
            {slide.icon}
          </div>
          {/* Slide counter */}
          <div style={{ color: '#A6CAF0', fontSize: 11, marginTop: 'auto' }}>
            {slideIdx + 1} / {slides.length}
          </div>
        </div>

        {/* Right content panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(to bottom right, #ECE9D8 0%, #D8D4C0 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 40px',
          gap: 16,
          overflow: 'auto',
        }}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.3s',
          }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#0A246A', marginBottom: 4 }}>
              {slide.title}
            </div>
            <div style={{ fontSize: 13, color: '#1B5FA8', marginBottom: 20, fontStyle: 'italic' }}>
              {slide.subtitle}
            </div>
            <div style={{ width: '100%', height: 2, background: 'linear-gradient(to right, #1B5FA8, transparent)', marginBottom: 20 }} />
            <div style={{ fontSize: 12, color: '#333', lineHeight: 1.8, marginBottom: 24 }}>
              {slide.content}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slide.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'linear-gradient(to bottom, #5DB226, #3D8B10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}>✓</div>
                  <span style={{ color: '#222' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div style={{
        padding: '10px 20px',
        background: '#ECE9D8',
        borderTop: '1px solid #ACA899',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Dot navigation */}
        <div style={{ display: 'flex', gap: 6 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === slideIdx ? 20 : 10,
                height: 10,
                borderRadius: 5,
                border: 'none',
                background: i === slideIdx ? '#1B5FA8' : '#ACA899',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="xp-btn"
            onClick={() => goTo(Math.max(0, slideIdx - 1))}
            disabled={slideIdx === 0}
            style={{ opacity: slideIdx === 0 ? 0.5 : 1, minWidth: 80 }}
          >
            ◀ Zurück
          </button>
          {slideIdx < slides.length - 1 ? (
            <button className="xp-btn xp-btn-primary" onClick={() => goTo(slideIdx + 1)} style={{ minWidth: 80 }}>
              Weiter ▶
            </button>
          ) : (
            <button className="xp-btn xp-btn-primary" style={{ minWidth: 100 }}>
              ✓ Schließen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
