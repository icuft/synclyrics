import { useEffect, useState } from 'react'
import { loadGoogleFont } from '../../utils/fonts'

const DEMO_LINES = [
  { words: ['THEY'], tier: 'xl' },
  { words: ['SAY', 'THAT'], tier: 'md' },
  { words: ['I\'M', 'ON'], tier: 'xl' },
  { words: ['A', 'ROLL'], tier: 'sm' },
]

const TIER: Record<string, string> = {
  xl: 'hp-lyr-xl',
  md: 'hp-lyr-md',
  sm: 'hp-lyr-sm',
}

export function HomeLyricStage() {
  const [step, setStep] = useState(0)
  const totalWords = DEMO_LINES.reduce((n, l) => n + l.words.length, 0)

  useEffect(() => {
    loadGoogleFont('Anton')
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (totalWords + 2))
    }, 850)
    return () => clearInterval(id)
  }, [totalWords])

  let wordCounter = 0
  const visibleEnd = step

  return (
    <div className="hp-preview">
      <div className="hp-preview-top">
        <span className="hp-preview-live">
          <span className="hp-preview-dot" />
          LIVE
        </span>
        <div className="hp-preview-eq">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="hp-eq" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      <div className="hp-preview-lyrics" style={{ fontFamily: 'Anton, sans-serif' }}>
        {DEMO_LINES.map((line, li) => {
          const lineWords = line.words.map((w) => {
            const idx = wordCounter++
            return { text: w, idx }
          })
          const visibleInLine = lineWords.filter((w) => w.idx < visibleEnd)
          if (visibleInLine.length === 0) return null

          return (
            <div key={li} className={`hp-lyr-line ${TIER[line.tier]}`}>
              {visibleInLine.map((w, i) => (
                <span key={w.idx} className={w.idx === visibleEnd - 1 ? 'hp-lyr-on' : 'hp-lyr-off'}>
                  {w.text}
                  {i < visibleInLine.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="hp-preview-bar">
        <div className="hp-preview-track">
          <div
            className="hp-preview-fill"
            style={{ width: `${Math.min(100, (step / totalWords) * 100)}%` }}
          />
        </div>
        <div className="hp-preview-time">
          <span>0:{String(Math.min(step, 23)).padStart(2, '0')}</span>
          <span>BLOK</span>
          <span>0:24</span>
        </div>
      </div>
    </div>
  )
}
