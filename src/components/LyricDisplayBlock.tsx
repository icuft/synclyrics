import { useMemo } from 'react'
import type { LyricLine } from '../types/lyrics'
import { getCurrentLineIndex } from '../utils/lrcParser'
import {
  BLOCK_TIER_CLASS,
  splitIntoBlockRows,
} from '../utils/blockLayout'
import { prepareLyrics } from '../utils/wordTiming'

interface LyricDisplayBlockProps {
  lines: LyricLine[]
  currentTime: number
  songDuration?: number
  fontFamily?: string
  theme?: 'dark' | 'light'
}

function getVisibleWordEndIndex(
  words: { time: number }[],
  currentTime: number,
): number {
  let end = -1
  for (let i = 0; i < words.length; i++) {
    if (currentTime >= words[i].time) end = i
    else break
  }
  return end
}

export function LyricDisplayBlock({
  lines,
  currentTime,
  songDuration,
  fontFamily,
  theme = 'dark',
}: LyricDisplayBlockProps) {
  const processed = useMemo(
    () => prepareLyrics(lines, songDuration),
    [lines, songDuration],
  )

  const activeLineIndex = useMemo(
    () => getCurrentLineIndex(lines, currentTime),
    [lines, currentTime],
  )

  const activeLine = processed[activeLineIndex]

  const visibleEndIndex = useMemo(() => {
    if (!activeLine) return -1
    return getVisibleWordEndIndex(activeLine.words, currentTime)
  }, [activeLine, currentTime])

  const blockRows = useMemo(() => {
    if (!activeLine || visibleEndIndex < 0) return []
    const visibleCount = visibleEndIndex + 1
    return splitIntoBlockRows(visibleCount)
  }, [activeLine, visibleEndIndex])

  const light = theme === 'light'

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 items-center px-8">
        <p className={`text-xs uppercase tracking-[0.2em] ${light ? 'text-[#888]' : 'text-neutral-600'}`}>
          Söz yok
        </p>
      </div>
    )
  }

  if (!activeLine || visibleEndIndex < 0) {
    return (
      <div className="flex flex-1 items-center px-8 py-10">
        <span className={`h-2 w-2 animate-pulse ${light ? 'bg-[#4361ee]' : 'bg-neutral-700'}`} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center px-8 py-10 lg:px-12">
      <div
        key={`${activeLineIndex}-${visibleEndIndex}`}
        className="block-lyric-enter w-full max-w-[360px] text-left"
        style={{ fontFamily }}
      >
        {blockRows.map((row, rowIndex) => (
          <div
            key={`${activeLineIndex}-${rowIndex}-${visibleEndIndex}`}
            className={[
              BLOCK_TIER_CLASS[row.tier],
              'font-black uppercase leading-[0.88] tracking-tight',
            ].join(' ')}
          >
            {row.wordIndices.map((localIndex, i) => {
              const word = activeLine.words[localIndex]
              const isActive = localIndex === visibleEndIndex

              return (
                <span
                  key={`${word.time}-${localIndex}`}
                  className={[
                    'inline-block transition-all duration-150',
                    isActive
                      ? `block-word-new ${light ? 'text-[#0d0d0d]' : 'text-white'}`
                      : light ? 'text-[#c8c8c8]' : 'text-neutral-500',
                  ].join(' ')}
                >
                  {word.text.toUpperCase()}
                  {i < row.wordIndices.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
