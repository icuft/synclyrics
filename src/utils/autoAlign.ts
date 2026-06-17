import type { LyricLine, LyricWord } from '../types/lyrics'

/** Satır zamanlarından kelime zamanları üretir (Whisper alternatifi, ücretsiz) */
export function autoAlignWords(
  lines: LyricLine[],
  songDuration?: number,
): LyricLine[] {
  return lines.map((line, index) => {
    const words = line.text.split(/\s+/).filter(Boolean)
    if (words.length === 0) return line

    const nextTime = lines[index + 1]?.time
    const endTime =
      nextTime ??
      (songDuration && songDuration > line.time
        ? songDuration
        : line.time + Math.max(2, words.length * 0.4))

    const duration = Math.max(0.3, endTime - line.time)
    const weights = words.map((w) => Math.max(1, w.length + (w.length > 4 ? 1 : 0)))
    const total = weights.reduce((a, b) => a + b, 0)

    let cursor = line.time
    const wordTimings: LyricWord[] = words.map((text, i) => {
      const slice = (weights[i] / total) * duration
      const w = { time: cursor, text }
      cursor += slice
      return w
    })

    return { ...line, words: wordTimings }
  })
}
