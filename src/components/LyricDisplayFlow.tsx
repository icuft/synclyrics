import { useMemo } from 'react'
import type { LyricLine } from '../types/lyrics'
import { getCurrentLineIndex } from '../utils/lrcParser'

interface LyricDisplayFlowProps {
  lines: LyricLine[]
  currentTime: number
  fontFamily?: string
  theme?: 'dark' | 'light'
}

export function LyricDisplayFlow({
  lines,
  currentTime,
  fontFamily,
  theme = 'dark',
}: LyricDisplayFlowProps) {
  const activeIndex = useMemo(
    () => getCurrentLineIndex(lines, currentTime),
    [lines, currentTime],
  )

  const light = theme === 'light'

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <p className={`text-xs uppercase tracking-[0.2em] ${light ? 'text-[#888]' : 'text-neutral-600'}`}>
          Söz yok
        </p>
      </div>
    )
  }

  const visibleRange = 2

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-8 py-10"
      style={{ fontFamily }}
    >
      <div className="flex w-full max-w-[300px] flex-col items-center gap-4">
        {lines.map((line, index) => {
          const distance = index - activeIndex
          if (Math.abs(distance) > visibleRange) return null

          const isActive = index === activeIndex
          const isPast = index < activeIndex

          return (
            <p
              key={`${line.time}-${index}`}
              className={[
                'w-full text-center leading-snug transition-all duration-300',
                isActive
                  ? `text-lg font-bold ${light ? 'text-[#0d0d0d]' : 'text-white'}`
                  : isPast
                    ? `text-sm ${light ? 'text-[#aaa]' : 'text-neutral-600'}`
                    : `text-sm ${light ? 'text-[#ccc]' : 'text-neutral-500'}`,
              ].join(' ')}
              style={{
                opacity: isActive
                  ? 1
                  : Math.max(0.25, 1 - Math.abs(distance) * 0.35),
              }}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}
