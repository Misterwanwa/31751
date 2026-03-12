'use client'
import { useState } from 'react'
import { quizBlocks, fernuniScore, QuizBlock } from '@/lib/quiz-data'

type Answers = Record<string, boolean | null>

export default function QuizApp() {
  const [blockIdx, setBlockIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const [accumulated, setAccumulated] = useState<{ topic: string; pts: number }[]>([])

  const block: QuizBlock = quizBlocks[blockIdx]

  function setAnswer(stmtId: string, val: boolean) {
    setAnswers(prev => ({ ...prev, [stmtId]: val }))
  }

  function allAnswered() {
    return block.statements.every(s => answers[s.id] !== undefined && answers[s.id] !== null)
  }

  function handleSubmit() {
    const correct = block.statements.filter(s => answers[s.id] === s.correct).length
    const pts = fernuniScore[correct]
    setTotalPoints(p => p + pts)
    setAccumulated(prev => [...prev, { topic: block.topic, pts }])
    setSubmitted(true)
  }

  function handleNext() {
    if (blockIdx + 1 >= quizBlocks.length) {
      setAllDone(true)
    } else {
      setBlockIdx(i => i + 1)
      setAnswers({})
      setSubmitted(false)
    }
  }

  function handleRestart() {
    setBlockIdx(0)
    setAnswers({})
    setSubmitted(false)
    setTotalPoints(0)
    setAccumulated([])
    setAllDone(false)
  }

  if (allDone) {
    return (
      <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
        {/* Left panel */}
        <div style={{
          width: 180, background: 'linear-gradient(to bottom, #1A4DAA, #0A246A)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20,
        }}>
          <span style={{ fontSize: 60 }}>🏆</span>
          <div style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>Prüfung abgeschlossen!</div>
        </div>
        {/* Right panel */}
        <div style={{ flex: 1, padding: 24, background: '#ECE9D8', overflow: 'auto' }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Ergebnis der Zertifikatsprüfung</h2>
          <div style={{ border: '1px solid #ACA899', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#1A4DAA', color: 'white' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Thema</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right' }}>Punkte</th>
                </tr>
              </thead>
              <tbody>
                {accumulated.map((a, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#F8F7F0' : '#ECE9D8' }}>
                    <td style={{ padding: '5px 10px' }}>{a.topic}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>{a.pts.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#DDD9C8', fontWeight: 'bold' }}>
                  <td style={{ padding: '6px 10px' }}>Gesamt</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 14 }}>
                    {totalPoints.toFixed(2)} / {(quizBlocks.length * 3).toFixed(0)} Punkte
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div style={{
            padding: 12, borderRadius: 4, marginBottom: 16,
            background: totalPoints >= quizBlocks.length * 2 ? '#D4EDDA' : '#FFF3CD',
            border: `1px solid ${totalPoints >= quizBlocks.length * 2 ? '#28A745' : '#FFC107'}`,
          }}>
            <strong>{totalPoints >= quizBlocks.length * 2 ? '✅ Bestanden!' : '⚠️ Nicht bestanden.'}</strong>
            {' '}{totalPoints.toFixed(2)} von {(quizBlocks.length * 3).toFixed(0)} Punkten
            ({((totalPoints / (quizBlocks.length * 3)) * 100).toFixed(0)}%)
          </div>
          <button className="xp-btn xp-btn-primary" onClick={handleRestart}>Nochmal starten</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      {/* Left panel – Installer style */}
      <div style={{
        width: 180,
        background: 'linear-gradient(to bottom, #1A4DAA 0%, #0A246A 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        gap: 20,
      }}>
        <span style={{ fontSize: 60, marginTop: 20 }}>📜</span>
        <div style={{ color: 'white', textAlign: 'center', fontSize: 11, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>FernUni<br />Zertifikatsprüfung</div>
          <div style={{ color: '#A6CAF0' }}>Block {blockIdx + 1} von {quizBlocks.length}</div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {quizBlocks.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 8px', borderRadius: 3,
              background: i === blockIdx ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}>
              <span style={{ fontSize: 10 }}>
                {i < blockIdx ? '✅' : i === blockIdx ? '▶️' : '⬜'}
              </span>
              <span style={{ color: i <= blockIdx ? 'white' : '#7A96DF', fontSize: 10, lineHeight: 1.3 }}>
                {b.topic}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ECE9D8', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #ECE9D8, #D8D5C4)',
          borderBottom: '1px solid #ACA899',
          padding: '12px 20px',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: 14 }}>{block.topic}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
            Für jede Aussage: Ist sie Richtig (R) oder Falsch (F)?
          </div>
        </div>

        {/* Statements */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          <div style={{ marginBottom: 12, fontSize: 11, color: '#555' }}>
            Bewertung: 0 richtig = 0 Pkt | 1 = 0,25 | 2 = 0,75 | 3 = 1,5 | 4 = 2,25 | 5 = 3 Punkte
          </div>
          {block.statements.map((stmt, idx) => {
            const ans = answers[stmt.id]
            const isCorrect = submitted ? ans === stmt.correct : null
            return (
              <div
                key={stmt.id}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  border: `1px solid ${submitted ? (isCorrect ? '#28A745' : '#DC3545') : '#ACA899'}`,
                  borderRadius: 4,
                  background: submitted
                    ? isCorrect ? '#D4EDDA' : '#F8D7DA'
                    : ans !== undefined && ans !== null ? '#EEF4FF' : 'white',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 8 }}>
                  Aussage {idx + 1}: <span style={{ fontWeight: 'normal' }}>{stmt.text}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: submitted ? 'default' : 'pointer', fontSize: 11 }}>
                    <input
                      type="radio"
                      name={stmt.id}
                      value="true"
                      checked={ans === true}
                      onChange={() => !submitted && setAnswer(stmt.id, true)}
                      disabled={submitted}
                      className="xp-radio"
                    />
                    <span style={{ fontWeight: 'bold', color: '#28A745' }}>R – Richtig</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: submitted ? 'default' : 'pointer', fontSize: 11 }}>
                    <input
                      type="radio"
                      name={stmt.id}
                      value="false"
                      checked={ans === false}
                      onChange={() => !submitted && setAnswer(stmt.id, false)}
                      disabled={submitted}
                      className="xp-radio"
                    />
                    <span style={{ fontWeight: 'bold', color: '#DC3545' }}>F – Falsch</span>
                  </label>
                  {submitted && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 'bold', color: isCorrect ? '#28A745' : '#DC3545' }}>
                      {isCorrect ? '✅ Korrekt' : `❌ Falsch (korrekt: ${stmt.correct ? 'Richtig' : 'Falsch'})`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {submitted && (
            <div style={{
              padding: 12, borderRadius: 4, marginTop: 8,
              background: '#D4EDDA', border: '1px solid #28A745',
            }}>
              <strong>Ergebnis Block {blockIdx + 1}:</strong>{' '}
              {block.statements.filter(s => answers[s.id] === s.correct).length} von 5 richtig →{' '}
              <strong>{fernuniScore[block.statements.filter(s => answers[s.id] === s.correct).length].toFixed(2)} Punkte</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #ACA899',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ECE9D8',
        }}>
          <div style={{ fontSize: 11, color: '#555' }}>
            Bisherige Punkte: <strong>{totalPoints.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!submitted ? (
              <button
                className="xp-btn xp-btn-primary"
                onClick={handleSubmit}
                disabled={!allAnswered()}
                style={{ opacity: allAnswered() ? 1 : 0.5 }}
              >
                Auswerten
              </button>
            ) : (
              <button className="xp-btn xp-btn-primary" onClick={handleNext}>
                {blockIdx + 1 < quizBlocks.length ? 'Weiter >' : 'Ergebnis anzeigen'}
              </button>
            )}
            <button className="xp-btn" onClick={handleRestart}>Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  )
}
