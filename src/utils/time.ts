export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
}

export function formatLrcTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2)
  return `[${String(mins).padStart(2, '0')}:${secs.padStart(5, '0')}]`
}
