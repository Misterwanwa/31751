'use client'
import { useState } from 'react'
import Image from 'next/image'

interface LoginScreenProps {
  onLogin: () => void
}

const USERS = [
  { name: 'Administrator', icon: '♟️' },
  { name: 'Steve', icon: '♟️' },
]

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  function handleUserClick(name: string) {
    if (selected === name) {
      onLogin()
    } else {
      setSelected(name)
      setPassword('')
    }
  }

  function handleLogin() {
    onLogin()
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Trebuchet MS', Tahoma, Arial, sans-serif",
      userSelect: 'none',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        height: 70,
        background: '#00309c',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        flexShrink: 0,
      }}>
        <Image
          src="/images/xp_logo_horizontal.png"
          alt="Windows XP"
          height={40}
          width={160}
          style={{ objectFit: 'contain', objectPosition: 'left' }}
        />
      </div>

      {/* Separator stripes */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #3833ac, #00309c)', flexShrink: 0 }} />
      <div style={{ height: 2, background: 'linear-gradient(45deg, #003399, #f99736, #c2814d, #00309c)', flexShrink: 0 }} />

      {/* Main area */}
      <div style={{
        flex: 1,
        background: 'radial-gradient(circle at 5% 5%, #91b1ef 0%, #7698e6 6%, #5a7edc 12%)',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        {/* Left panel */}
        <div style={{
          flex: '0 0 340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 40px',
          borderRight: '1px solid rgba(255,255,255,0.25)',
        }}>
          <div style={{
            color: '#ffffff',
            fontSize: 13,
            lineHeight: 1.6,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}>
            <p style={{ marginBottom: 8 }}>To begin, click your user name</p>
          </div>
        </div>

        {/* Center – Welcome + user list */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}>
          <div style={{
            color: '#f0f4ff',
            fontSize: 42,
            fontStyle: 'italic',
            fontWeight: 'bold',
            textShadow: '1px 2px 4px rgba(0,0,0,0.3)',
            marginBottom: 32,
            letterSpacing: 1,
          }}>
            Welcome
          </div>

          {/* User list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {USERS.map(user => (
              <div
                key={user.name}
                onClick={() => handleUserClick(user.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 4,
                  background: selected === user.name ? 'rgba(255,255,255,0.15)' : 'transparent',
                  minWidth: 280,
                  transition: 'background 0.1s',
                }}
              >
                {/* User avatar */}
                <div style={{
                  width: 54,
                  height: 54,
                  background: 'linear-gradient(135deg, #CC2200 0%, #881100 100%)',
                  border: '3px solid rgba(255,255,255,0.5)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  flexShrink: 0,
                  boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                }}>
                  ♟
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 700,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    marginBottom: selected === user.name ? 6 : 0,
                  }}>
                    {user.name}
                  </div>

                  {selected === user.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="Type your password"
                        autoFocus
                        style={{
                          background: '#ffffff',
                          border: '1px solid #7A96DF',
                          borderRadius: 2,
                          padding: '2px 6px',
                          fontSize: 11,
                          width: 130,
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          outline: 'none',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        onClick={e => { e.stopPropagation(); handleLogin() }}
                        style={{
                          width: 22,
                          height: 22,
                          background: 'linear-gradient(to bottom, #5EA0E0 0%, #1A5CAA 100%)',
                          border: '1px solid #0A246A',
                          borderRadius: 2,
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Log On"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separator stripes (bottom) */}
      <div style={{ height: 2, background: 'linear-gradient(45deg, #003399, #f99736, #c2814d, #00309c)', flexShrink: 0 }} />
      <div style={{ height: 2, background: 'linear-gradient(90deg, #3833ac, #00309c)', flexShrink: 0 }} />

      {/* Footer bar */}
      <div style={{
        height: 70,
        background: '#00309c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        {/* Turn off */}
        <button
          onClick={() => {}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            fontFamily: "'Trebuchet MS', Tahoma, Arial, sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E05030 0%, #C03010 100%)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}>
            ⏻
          </div>
          Turn off computer
        </button>

        <div style={{
          color: '#c0d4f8',
          fontSize: 11,
          textAlign: 'right',
          lineHeight: 1.6,
          fontFamily: 'Tahoma, Arial, sans-serif',
        }}>
          After you log on, you can add or change accounts.<br />
          Just go to Control Panel and click User Accounts.
        </div>
      </div>
    </div>
  )
}
