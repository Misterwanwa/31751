'use client'
import { useState } from 'react'

interface Email {
  id: string
  from: string
  subject: string
  date: string
  read: boolean
  body: string
  folder: string
}

const EMAILS: Email[] = [
  {
    id: '1', folder: 'Posteingang', read: false,
    from: 'Microsoft <update@microsoft.com>',
    subject: 'Sicherheitsupdate für Windows XP verfügbar',
    date: '06.03.2003',
    body: `Sehr geehrte/r Windows XP-Nutzer/in,

Ein neues Sicherheitsupdate für Windows XP ist jetzt verfügbar.

Dieses Update schließt eine kritische Sicherheitslücke im Windows-Betriebssystem. Wir empfehlen Ihnen dringend, das Update so bald wie möglich zu installieren.

Um das Update herunterzuladen:
1. Klicken Sie auf Start → Windows Update
2. Klicken Sie auf "Updates suchen"
3. Installieren Sie alle empfohlenen Updates

Mit freundlichen Grüßen,
Das Windows Update-Team
Microsoft Corporation`,
  },
  {
    id: '2', folder: 'Posteingang', read: false,
    from: 'Anna Schmidt <anna@hotmail.de>',
    subject: 'Re: Lerngruppe Mittwoch?',
    date: '05.03.2003',
    body: `Hey!

Ja, Mittwoch passt super! Ich bringe meine Notizen aus der Vorlesung mit.

Treffen wir uns um 14 Uhr in der Bibliothek? Der Gruppenarbeitsraum im 2. OG sollte frei sein.

Kannst du noch Max und Lisa fragen ob sie dabei sind?

Liebe Grüße,
Anna 😊

--
Anna Schmidt
anna@hotmail.de`,
  },
  {
    id: '3', folder: 'Posteingang', read: true,
    from: 'FernUniversität Hagen <info@fernuni-hagen.de>',
    subject: 'Ihre Einschreibebestätigung – SoSe 2003',
    date: '01.03.2003',
    body: `Sehr geehrte Studentin, sehr geehrter Student,

wir freuen uns, Ihnen Ihre erfolgreiche Einschreibung für das Sommersemester 2003 bestätigen zu können.

Gebuchte Module:
- Informationsmodellierung (31751)
- Datenstrukturen und Algorithmen (1663)

Die Studienunterlagen werden Ihnen in den nächsten Tagen per Post zugesandt.

Für Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Die Einschreibestelle der FernUniversität in Hagen`,
  },
  {
    id: '4', folder: 'Posteingang', read: true,
    from: 'Max Müller <max.m@msn.com>',
    subject: 'Hej! :)',
    date: '04.03.2003',
    body: `Hey,

Nur mal kurz fragen wie's dir geht! Habt ihr schon die Übungsaufgaben von letzter Woche fertig?

Ich hänge noch bei Aufgabe 3 mit dem ER-Diagramm. Kannst du mir da vielleicht helfen?

Lass mal was hören!
Max

Gesendet mit Windows Messenger`,
  },
  {
    id: '5', folder: 'Gesendet', read: true,
    from: 'Ich',
    subject: 'Re: Lerngruppe Mittwoch?',
    date: '05.03.2003',
    body: `Hi Anna!

Super, Mittwoch passt mir auch gut. 14 Uhr in der Bibliothek ist perfekt.

Ich frage noch Max und Lisa.

Bis dann!`,
  },
  {
    id: '6', folder: 'Entwürfe', read: true,
    from: 'Ich',
    subject: 'Frage zur Prüfungsanmeldung',
    date: '06.03.2003',
    body: `Sehr geehrte Damen und Herren,

ich habe eine Frage zur Prüfungsanmeldung für das Modul 31751...

[ENTWURF - nicht gesendet]`,
  },
]

const FOLDERS = [
  { name: 'Outlook Express', icon: '📧', children: [
    { name: 'Lokale Ordner', icon: '📁', children: [
      { name: 'Posteingang', icon: '📥', count: EMAILS.filter(e => e.folder === 'Posteingang' && !e.read).length },
      { name: 'Postausgang', icon: '📤', count: 0 },
      { name: 'Gesendet', icon: '✉️', count: 0 },
      { name: 'Gelöscht', icon: '🗑️', count: 0 },
      { name: 'Entwürfe', icon: '📝', count: 0 },
    ]},
  ]},
]

export default function OutlookApp() {
  const [selectedFolder, setSelectedFolder] = useState('Posteingang')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [emails, setEmails] = useState<Email[]>(EMAILS)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Outlook Express', 'Lokale Ordner']))
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  const folderEmails = emails.filter(e => e.folder === selectedFolder)
  const unread = (folder: string) => emails.filter(e => e.folder === folder && !e.read).length

  function selectEmail(email: Email) {
    setSelectedEmail(email)
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e))
  }

  function deleteEmail() {
    if (!selectedEmail) return
    setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, folder: 'Gelöscht' } : e))
    setSelectedEmail(null)
  }

  if (showCompose) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
        <div className="xp-menubar">
          {['Datei', 'Bearbeiten', 'Ansicht', 'Einfügen', 'Format', 'Extras', 'Hilfe'].map(m => <span key={m} className="xp-menu-item">{m}</span>)}
        </div>
        <div className="xp-toolbar">
          <button className="xp-btn xp-btn-primary" onClick={() => { setShowCompose(false); alert('Nachricht gesendet!') }}>📤 Senden</button>
          <div className="xp-separator" />
          <button className="xp-btn" onClick={() => setShowCompose(false)}>✕ Schließen</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderBottom: '1px solid #ACA899' }}>
          {[
            { label: 'An:', value: composeTo, set: setComposeTo, ph: 'empfaenger@beispiel.de' },
            { label: 'Betreff:', value: composeSubject, set: setComposeSubject, ph: 'Betreff der Nachricht' },
          ].map(field => (
            <div key={field.label} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #DDD', padding: '3px 8px', gap: 6 }}>
              <span style={{ width: 60, fontWeight: 'bold' }}>{field.label}</span>
              <input className="xp-input" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none' }}
                value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.ph} />
            </div>
          ))}
        </div>
        <textarea
          style={{ flex: 1, border: 'none', outline: 'none', padding: 12, fontFamily: 'Tahoma, sans-serif', fontSize: 12, resize: 'none' }}
          value={composeBody} onChange={e => setComposeBody(e.target.value)}
          placeholder="Nachricht hier eingeben..."
        />
        <div className="xp-statusbar"><span>Bereit</span></div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
      {/* Menu */}
      <div className="xp-menubar">
        {['Datei', 'Bearbeiten', 'Ansicht', 'Extras', 'Nachrichten', 'Hilfe'].map(m => <span key={m} className="xp-menu-item">{m}</span>)}
      </div>

      {/* Toolbar */}
      <div className="xp-toolbar">
        <button className="xp-btn" onClick={() => setShowCompose(true)}>✏️ Neu</button>
        <button className="xp-btn" disabled={!selectedEmail}>↩️ Antworten</button>
        <button className="xp-btn" disabled={!selectedEmail}>↪️ Weiterleiten</button>
        <div className="xp-separator" />
        <button className="xp-btn" onClick={deleteEmail} disabled={!selectedEmail}>🗑️ Löschen</button>
        <div className="xp-separator" />
        <button className="xp-btn">📡 Senden/Empfangen</button>
        <div className="xp-separator" />
        <button className="xp-btn">🔍 Suchen</button>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Folder tree */}
        <div style={{ width: 180, borderRight: '1px solid #ACA899', overflow: 'auto', background: '#F8F7F0', flexShrink: 0, padding: '4px 0' }}>
          {[
            { name: 'Posteingang', icon: '📥' },
            { name: 'Postausgang', icon: '📤' },
            { name: 'Gesendet', icon: '✉️' },
            { name: 'Entwürfe', icon: '📝' },
            { name: 'Gelöscht', icon: '🗑️' },
          ].map(f => {
            const cnt = unread(f.name)
            return (
              <div key={f.name}
                onClick={() => { setSelectedFolder(f.name); setSelectedEmail(null) }}
                style={{
                  padding: '5px 8px 5px 20px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  background: selectedFolder === f.name ? '#316AC5' : 'transparent',
                  color: selectedFolder === f.name ? 'white' : '#000',
                  fontWeight: cnt > 0 ? 'bold' : 'normal',
                }}
                onMouseEnter={e => { if (selectedFolder !== f.name) e.currentTarget.style.background = '#EEF4FF' }}
                onMouseLeave={e => { if (selectedFolder !== f.name) e.currentTarget.style.background = 'transparent' }}
              >
                <span>{f.icon}</span>
                <span style={{ flex: 1 }}>{f.name}</span>
                {cnt > 0 && <span style={{ background: selectedFolder === f.name ? 'white' : '#316AC5', color: selectedFolder === f.name ? '#316AC5' : 'white', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>{cnt}</span>}
              </div>
            )
          })}
          <div style={{ height: 1, background: '#ACA899', margin: '4px 0' }} />
          <div style={{ padding: '5px 8px 5px 20px', fontSize: 10, color: '#888' }}>Nachrichten</div>
          <div style={{ padding: '5px 8px 5px 20px', fontSize: 10, color: '#316AC5', cursor: 'pointer' }}>📰 Outlook-Newsletter</div>
        </div>

        {/* Right: email list + preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Email list */}
          <div style={{ height: '40%', borderBottom: '1px solid #ACA899', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr 80px', background: '#ECE9D8', borderBottom: '1px solid #ACA899', padding: '3px 8px', gap: 8, fontWeight: 'bold', fontSize: 10 }}>
              <span></span><span>Von</span><span>Betreff</span><span>Datum</span>
            </div>
            {folderEmails.length === 0 && (
              <div style={{ padding: 16, color: '#888', textAlign: 'center' }}>Keine Nachrichten</div>
            )}
            {folderEmails.map(email => (
              <div key={email.id}
                onClick={() => selectEmail(email)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1fr 1fr 80px',
                  padding: '4px 8px',
                  gap: 8,
                  cursor: 'pointer',
                  background: selectedEmail?.id === email.id ? '#316AC5' : email.read ? 'white' : '#EEF4FF',
                  color: selectedEmail?.id === email.id ? 'white' : '#000',
                  borderBottom: '1px solid #F0EFE6',
                  fontWeight: email.read ? 'normal' : 'bold',
                  fontSize: 11,
                }}
                onMouseEnter={e => { if (selectedEmail?.id !== email.id) e.currentTarget.style.background = '#EEF4FF' }}
                onMouseLeave={e => { if (selectedEmail?.id !== email.id) e.currentTarget.style.background = email.read ? 'white' : '#EEF4FF' }}
              >
                <span>{email.read ? '✉️' : '📩'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.from.split('<')[0].trim()}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject}
                </span>
                <span style={{ fontSize: 10 }}>{email.date}</span>
              </div>
            ))}
          </div>

          {/* Preview pane */}
          <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
            {selectedEmail ? (
              <div style={{ padding: 12 }}>
                <div style={{ borderBottom: '2px solid #C8D8F7', paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{selectedEmail.subject}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>
                    <span><strong>Von:</strong> {selectedEmail.from}</span><br />
                    <span><strong>Datum:</strong> {selectedEmail.date}</span>
                  </div>
                </div>
                <pre style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {selectedEmail.body}
                </pre>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: 12 }}>
                Klicken Sie auf eine Nachricht, um sie zu lesen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <div className="xp-statusbar-panel">{folderEmails.length} Nachricht(en)</div>
        <div className="xp-statusbar-panel">{unread(selectedFolder)} ungelesen</div>
        <div style={{ marginLeft: 'auto' }} className="xp-statusbar-panel">🌐 Verbunden</div>
      </div>
    </div>
  )
}
