import { useMemo } from 'react'
import type { LyricLine } from '../types/lyrics'
import { getCurrentLineIndex } from '../utils/lrcParser'
import {
  getCurrentWordIndex,
  prepareLyrics,
} from '../utils/wordTiming'

interface LyricDisplayKaraokeProps {
  lines: LyricLine[]
  currentTime: number
  songDuration?: number
  fontFamily?: string
  theme?: 'dark' | 'light'
}

export function LyricDisplayKaraoke({
  lines,
  currentTime,
  songDuration,
  fontFamily,
  theme = 'dark',
}: LyricDisplayKaraokeProps) {
  const processed = useMemo(
    () => prepareLyrics(lines, songDuration),
    [lines, songDuration],
  )

  const activeLineIndex = useMemo(
    () => getCurrentLineIndex(lines, currentTime),
    [lines, currentTime],
  )

  const activeLine = processed[activeLineIndex]
  const activeWordIndex = useMemo(() => {
    if (!activeLine) return -1
    return getCurrentWordIndex(activeLine.words, currentTime)
  }, [activeLine, currentTime])

  const light = theme === 'light'

  if (!activeLine) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <p className={`text-xs uppercase tracking-widest ${light ? 'text-[#888]' : 'text-neutral-600'}`}>—</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-8"
      style={{ fontFamily }}
    >
      <div
        key={activeLineIndex}
        className="karaoke-line-enter flex max-w-[320px] flex-wrap justify-center gap-x-2 gap-y-1 text-center"
      >
        {activeLine.words.map((word, index) => {
          const isActive = index === activeWordIndex
          const isPast = index < activeWordIndex

          return (
            <span
              key={`${word.time}-${index}`}
              className={[
                'text-xl font-bold uppercase tracking-tight transition-all duration-150',
                isActive
                  ? `scale-110 ${light ? 'text-[#4361ee]' : 'text-white'}`
                  : isPast
                    ? light ? 'text-[#bbb]' : 'text-neutral-500'
                    : light ? 'text-[#ddd]' : 'text-neutral-700',
              ].join(' ')}
            >
              {word.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
