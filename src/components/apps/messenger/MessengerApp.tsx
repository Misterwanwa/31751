'use client'
import { useState, useRef, useEffect } from 'react'

type Status = 'online' | 'away' | 'busy' | 'offline'

interface Contact {
  id: string
  name: string
  email: string
  status: Status
  statusMsg: string
  avatar: string
}

interface ChatMsg { from: string; text: string; time: string }

const STATUS_COLORS: Record<Status, string> = {
  online: '#00A000',
  away: '#FFA500',
  busy: '#CC0000',
  offline: '#888',
}
const STATUS_ICONS: Record<Status, string> = {
  online: '🟢',
  away: '🟡',
  busy: '🔴',
  offline: '⚫',
}
const STATUS_LABELS: Record<Status, string> = {
  online: 'Online',
  away: 'Abwesend',
  busy: 'Beschäftigt',
  offline: 'Offline',
}

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Anna Schmidt', email: 'anna.schmidt@hotmail.de', status: 'online', statusMsg: 'Lerne gerade 📚', avatar: '👩' },
  { id: '2', name: 'Max Müller', email: 'max.m@msn.com', status: 'online', statusMsg: 'Hej :)', avatar: '👨' },
  { id: '3', name: 'Lisa Weber', email: 'lisa.web@hotmail.com', status: 'away', statusMsg: 'Bin kurz weg...', avatar: '👩‍🦰' },
  { id: '4', name: 'Tom Fischer', email: 'tomfisch@live.de', status: 'busy', statusMsg: 'Nicht stören!', avatar: '👨‍💼' },
  { id: '5', name: 'Julia Koch', email: 'jkoch@hotmail.de', status: 'offline', statusMsg: 'Bis später!', avatar: '👩‍🎓' },
  { id: '6', name: 'David Wagner', email: 'david.w@msn.com', status: 'online', statusMsg: '⚽ Fußball schauen', avatar: '👦' },
]

const AUTO_REPLIES: Record<string, string[]> = {
  '1': ['Hey! Wie gehts?', 'Lernst du auch für die Prüfung?', 'Magst du in der Lerngruppe mitmachen?', 'Ich hab gerade eine Lernpause 😄'],
  '2': ['Hej! Alles klar!', 'Was machst du gerade?', 'Hast du die Hausaufgaben schon?', 'Cool! Bis später dann 👋'],
  '3': ['Bin gleich wieder da!', '...', 'Sorry, musste kurz weg'],
  '4': ['Nicht jetzt, bin beschäftigt!', 'Schreib mir später.'],
  '6': ['Toooor!!! 🎉', 'Spiel läuft noch...', 'Wer schaut das Spiel?'],
}

export default function MessengerApp() {
  const [myStatus, setMyStatus] = useState<Status>('online')
  const [myStatusMsg, setMyStatusMsg] = useState('Windows XP ist das Beste!')
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({})
  const [inputMsg, setInputMsg] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const activeChatContact = contacts.find(c => c.id === activeChat)
  const activeChatMsgs = activeChat ? (chats[activeChat] || []) : []

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChatMsgs])

  function sendMessage() {
    if (!inputMsg.trim() || !activeChat) return
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    const newMsg: ChatMsg = { from: 'me', text: inputMsg, time }
    setChats(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }))
    setInputMsg('')

    // Auto reply after delay
    const replies = AUTO_REPLIES[activeChat] || ['...']
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const contact = contacts.find(c => c.id === activeChat)
    if (contact && contact.status !== 'offline') {
      setTimeout(() => {
        const replyMsg: ChatMsg = { from: activeChat, text: reply, time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }
        setChats(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), replyMsg] }))
      }, 1000 + Math.random() * 2000)
    }
  }

  const online = contacts.filter(c => c.status === 'online')
  const other = contacts.filter(c => c.status !== 'online')

  if (activeChat) {
    const contact = activeChatContact!
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', background: 'white' }}>
        {/* Chat title bar (secondary) */}
        <div style={{
          background: 'linear-gradient(to right, #0A246A, #316AC5)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'white',
          fontSize: 12,
        }}>
          <span style={{ fontSize: 24 }}>{contact.avatar}</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{contact.name}</div>
            <div style={{ fontSize: 10, color: '#A6CAF0' }}>{STATUS_ICONS[contact.status]} {STATUS_LABELS[contact.status]} – {contact.statusMsg}</div>
          </div>
          <button className="xp-btn" style={{ marginLeft: 'auto', fontSize: 10 }} onClick={() => setActiveChat(null)}>
            ← Kontaktliste
          </button>
        </div>

        {/* Chat history */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12, background: '#F8F7F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeChatMsgs.length === 0 && (
            <div style={{ color: '#888', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
              Sie haben ein Gespräch mit {contact.name} gestartet.<br />
              {contact.status === 'offline' ? '(Kontakt ist offline – Nachricht wird zugestellt, wenn er online ist)' : ''}
            </div>
          )}
          {activeChatMsgs.map((msg, i) => {
            const isMe = msg.from === 'me'
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>
                  {isMe ? 'Ich' : contact.name} ({msg.time})
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '6px 10px',
                  background: isMe ? '#DCF8C6' : 'white',
                  border: `1px solid ${isMe ? '#A8D5A2' : '#DDD'}`,
                  borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  fontSize: 12,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}>
                  {msg.text}
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '2px solid #C8D8F7',
          padding: '6px 8px',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {/* Emoji toolbar */}
          <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
            {['😊', '😂', '😎', '❤️', '👍', '😢', '🎉', '😡'].map(e => (
              <button key={e} onClick={() => setInputMsg(m => m + e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>
                {e}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888', alignSelf: 'center' }}>
              Schriftart | Farbe
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="xp-input"
              style={{ flex: 1, fontSize: 12 }}
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Nachricht eingeben..."
              autoFocus
            />
            <button className="xp-btn xp-btn-primary" onClick={sendMessage} style={{ minWidth: 70 }}>
              Senden
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Contact list view
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to bottom, #1B5FA8 0%, #0A246A 100%)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {/* MSN Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🦋</span>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontStyle: 'italic' }}>Windows Messenger</div>
        </div>
        {/* My status */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 4,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }} onClick={() => setShowStatusMenu(s => !s)}>
          <span style={{ fontSize: 24 }}>👤</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>Ich</div>
            <div style={{ color: '#A6CAF0', fontSize: 10 }}>{STATUS_ICONS[myStatus]} {STATUS_LABELS[myStatus]} – {myStatusMsg}</div>
          </div>
          <span style={{ color: 'white', fontSize: 10 }}>▼</span>
        </div>
        {showStatusMenu && (
          <div style={{
            position: 'absolute', top: 95, left: 12, right: 12,
            background: 'white', border: '1px solid #ACA899', borderRadius: 4,
            boxShadow: '2px 2px 8px rgba(0,0,0,0.3)', zIndex: 10,
          }}>
            {(['online', 'away', 'busy', 'offline'] as Status[]).map(s => (
              <div key={s}
                onClick={() => { setMyStatus(s); setShowStatusMenu(false) }}
                style={{
                  padding: '6px 10px', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center',
                  background: myStatus === s ? '#EEF4FF' : 'white', fontSize: 11,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#316AC5'}
                onMouseLeave={e => e.currentTarget.style.background = myStatus === s ? '#EEF4FF' : 'white'}
              >
                <span>{STATUS_ICONS[s]}</span>
                <span style={{ color: STATUS_COLORS[s], fontWeight: myStatus === s ? 'bold' : 'normal' }}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ background: '#ECE9D8', borderBottom: '1px solid #ACA899', padding: '3px 6px', display: 'flex', gap: 4 }}>
        {['Datei', 'Kontakte', 'Aktionen', 'Extras', 'Hilfe'].map(m => (
          <span key={m} className="xp-menu-item">{m}</span>
        ))}
      </div>

      {/* Contacts */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {/* Online */}
        <div style={{ padding: '4px 8px', background: '#D8E8FF', fontWeight: 'bold', fontSize: 10, color: '#0A246A', display: 'flex', justifyContent: 'space-between' }}>
          <span>🟢 Online ({online.length})</span>
        </div>
        {online.map(c => (
          <div key={c.id} onDoubleClick={() => setActiveChat(c.id)}
            style={{ padding: '6px 10px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'default', borderBottom: '1px solid #F0EFE6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF4FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 22 }}>{c.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: 11 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>{c.statusMsg}</div>
            </div>
            <button className="xp-btn" style={{ fontSize: 9, padding: '1px 5px' }} onClick={() => setActiveChat(c.id)}>Chat</button>
          </div>
        ))}

        {/* Others */}
        <div style={{ padding: '4px 8px', background: '#EEEDE6', fontWeight: 'bold', fontSize: 10, color: '#555', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span>Abwesend/Offline ({other.length})</span>
        </div>
        {other.map(c => (
          <div key={c.id}
            style={{ padding: '6px 10px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'default', opacity: c.status === 'offline' ? 0.6 : 1, borderBottom: '1px solid #F0EFE6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 22, filter: 'grayscale(80%)' }}>{c.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: c.status === 'offline' ? '#888' : '#333' }}>{c.name}</div>
              <div style={{ fontSize: 10, color: '#888', fontStyle: 'italic' }}>
                {STATUS_ICONS[c.status]} {STATUS_LABELS[c.status]} – {c.statusMsg}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div style={{ padding: '6px 8px', borderTop: '1px solid #ACA899', background: '#ECE9D8', display: 'flex', gap: 4 }}>
        <button className="xp-btn" style={{ flex: 1, fontSize: 10 }}>➕ Kontakt hinzufügen</button>
        <button className="xp-btn" style={{ flex: 1, fontSize: 10 }}>📂 Dateien senden</button>
      </div>
    </div>
  )
}
