import type { LyricDisplayMode } from '../types/lyrics'
import type { LyricLine } from '../types/lyrics'
import { LyricDisplayBlock } from './LyricDisplayBlock'
import { LyricDisplayFlow } from './LyricDisplayFlow'
import { LyricDisplayKaraoke } from './LyricDisplayKaraoke'

interface LyricDisplayProps {
  mode: LyricDisplayMode
  lines: LyricLine[]
  currentTime: number
  songDuration?: number
  fontFamily?: string
  theme?: 'dark' | 'light'
}

export function LyricDisplay({
  mode,
  lines,
  currentTime,
  songDuration,
  fontFamily,
  theme = 'dark',
}: LyricDisplayProps) {
  if (mode === 'flow') {
    return (
      <LyricDisplayFlow
        lines={lines}
        currentTime={currentTime}
        fontFamily={fontFamily}
        theme={theme}
      />
    )
  }

  if (mode === 'karaoke') {
    return (
      <LyricDisplayKaraoke
        lines={lines}
        currentTime={currentTime}
        songDuration={songDuration}
        fontFamily={fontFamily}
        theme={theme}
      />
    )
  }

  return (
    <LyricDisplayBlock
      lines={lines}
      currentTime={currentTime}
      songDuration={songDuration}
      fontFamily={fontFamily}
      theme={theme}
    />
  )
}
