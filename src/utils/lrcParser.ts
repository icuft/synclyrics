import type { LyricLine } from '../types/lyrics'
import { formatLrcTimestamp } from './time'
import { parseWordsFromEnhancedText } from './wordTiming'

const LINE_REGEX = /^\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/
const META_REGEX = /^\[([a-zA-Z]+):(.+)\]$/

export function parseLRCMetadata(lrcText: string): Record<string, string> {
  const metadata: Record<string, string> = {}

  for (const line of lrcText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || LINE_REGEX.test(trimmed)) continue

    const match = trimmed.match(META_REGEX)
    if (match) metadata[match[1]] = match[2].trim()
  }

  return metadata
}

export function parseLRC(lrcText: string): LyricLine[] {
  return lrcText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(LINE_REGEX)
      if (!match) return null

      const minutes = Number.parseInt(match[1], 10)
      const seconds = Number.parseFloat(match[2])
      const rawContent = match[3].trim()
      if (!rawContent) return null

      const words = parseWordsFromEnhancedText(rawContent)
      const text = words
        ? words.map((w) => w.text).join(' ')
        : rawContent.replace(/<[^>]+>/g, '').trim()

      if (!text) return null

      return {
        time: minutes * 60 + seconds,
        text,
        ...(words ? { words } : {}),
      }
    })
    .filter((line): line is LyricLine => line !== null)
    .sort((a, b) => a.time - b.time)
}

export function serializeLRC(
  lines: LyricLine[],
  metadata: Record<string, string> = {},
): string {
  const metaLines = Object.entries(metadata).map(
    ([key, value]) => `[${key}:${value}]`,
  )

  const lyricLines = lines.map((line) => {
    if (line.words && line.words.length > 0) {
      const wordPart = line.words
        .map((w) => {
          const inner = formatLrcTimestamp(w.time).slice(1, -1)
          return `<${inner}>${w.text}`
        })
        .join(' ')
      return `${formatLrcTimestamp(line.time)}${wordPart}`
    }
    return `${formatLrcTimestamp(line.time)}${line.text}`
  })

  return [...metaLines, '', ...lyricLines].join('\n')
}

export function getCurrentLineIndex(
  lines: LyricLine[],
  currentTime: number,
): number {
  if (lines.length === 0) return -1

  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) return i
  }

  return 0
}
