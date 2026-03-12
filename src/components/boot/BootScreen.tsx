'use client'
import { useEffect, useState } from 'react'

interface BootScreenProps {
  onDone: () => void
}

export default function BootScreen({ onDone }: BootScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate the progress bar ~3 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onDone, 400)
          return 100
        }
        return prev + 2
      })
    }, 60)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Windows XP Professional Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {/* Flag logo */}
        <div style={{ marginBottom: 8 }}>
          <svg width="100" height="96" viewBox="0 0 100 96" fill="none">
            {/* Top-left: red */}
            <path d="M0 0 Q48 4 46 46 Q24 44 0 48 Z" fill="#E03000" />
            {/* Top-right: green */}
            <path d="M100 0 Q52 4 54 46 Q76 44 100 48 Z" fill="#5BA318" />
            {/* Bottom-left: blue */}
            <path d="M0 96 Q48 92 46 50 Q24 52 0 48 Z" fill="#1A60B8" />
            {/* Bottom-right: yellow */}
            <path d="M100 96 Q52 92 54 50 Q76 52 100 48 Z" fill="#FFBB00" />
          </svg>
        </div>

        {/* "Microsoft" text */}
        <div style={{
          color: '#FFFFFF',
          fontSize: 13,
          fontFamily: 'Tahoma, Arial, sans-serif',
          letterSpacing: 0.5,
          marginBottom: 2,
        }}>
          Microsoft<sup style={{ fontSize: 8 }}>®</sup>
        </div>

        {/* "Windows" text */}
        <div style={{
          color: '#FFFFFF',
          fontSize: 52,
          fontFamily: 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif',
          fontWeight: 400,
          letterSpacing: -1,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'flex-start',
        }}>
          <span>Windows</span>
          <span style={{
            color: '#FF6A00',
            fontSize: 28,
            fontFamily: 'Franklin Gothic Medium, Arial, sans-serif',
            fontWeight: 700,
            marginLeft: 4,
            marginTop: 6,
          }}>xp</span>
        </div>

        {/* "Professional" text */}
        <div style={{
          color: '#CCCCCC',
          fontSize: 16,
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontWeight: 300,
          letterSpacing: 3,
          marginTop: 2,
          marginBottom: 32,
        }}>
          Professional
        </div>

        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 10,
          border: '1px solid #444',
          borderRadius: 2,
          overflow: 'hidden',
          background: '#111',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(to right, #1A5EAA, #4A9EEA)',
            transition: 'width 0.06s linear',
            borderRadius: 1,
          }} />
        </div>
      </div>

      {/* Bottom copyright */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        color: '#888',
        fontSize: 10,
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}>
        Copyright © 1985-2001<br />
        Microsoft Corporation
      </div>

      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        color: '#888',
        fontSize: 12,
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontStyle: 'italic',
      }}>
        Microsoft
      </div>
    </div>
  )
}
