import type { LyricLine, LyricWord, ProcessedLyricLine } from '../types/lyrics'

const WORD_TAG_REGEX = /<(\d{1,2}):(\d{2}(?:\.\d{1,3})?)>/g

export function parseWordsFromEnhancedText(
  content: string,
): LyricWord[] | undefined {
  const tags = [...content.matchAll(WORD_TAG_REGEX)]
  if (tags.length === 0) return undefined

  const words: LyricWord[] = []

  for (let i = 0; i < tags.length; i++) {
    const match = tags[i]
    const minutes = Number.parseInt(match[1], 10)
    const seconds = Number.parseFloat(match[2])
    const start = match.index! + match[0].length
    const end = i + 1 < tags.length ? tags[i + 1].index! : content.length
    const text = content.slice(start, end).trim()

    if (text) {
      words.push({ time: minutes * 60 + seconds, text })
    }
  }

  return words.length > 0 ? words : undefined
}

export function interpolateLineWords(
  line: LyricLine,
  nextLineTime: number | null,
  songDuration?: number,
): LyricWord[] {
  if (line.words && line.words.length > 0) return line.words

  const words = line.text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const fallbackEnd =
    songDuration && songDuration > line.time
      ? songDuration
      : line.time + 4

  const endTime = nextLineTime ?? fallbackEnd
  const totalDuration = Math.max(0.4, endTime - line.time)
  const weights = words.map((w) => Math.max(1, w.length))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  let cursor = line.time

  return words.map((text, index) => {
    const slice = (weights[index] / totalWeight) * totalDuration
    const word = { time: cursor, text }
    cursor += slice
    return word
  })
}

export function prepareLyrics(
  lines: LyricLine[],
  songDuration?: number,
): ProcessedLyricLine[] {
  return lines.map((line, index) => {
    const nextLineTime = lines[index + 1]?.time ?? null
    return {
      ...line,
      words: interpolateLineWords(line, nextLineTime, songDuration),
    }
  })
}

export function getCurrentWordIndex(
  words: LyricWord[],
  currentTime: number,
): number {
  if (words.length === 0) return -1

  for (let i = words.length - 1; i >= 0; i--) {
    if (currentTime >= words[i].time) return i
  }

  return 0
}
