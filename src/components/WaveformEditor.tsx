import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { formatTime } from '../utils/time'

interface WaveformEditorProps {
  audioUrl: string | null
  currentTime: number
  duration: number
  markers: number[]
  onSeek: (time: number) => void
  onMarkerAdd?: (time: number) => void
}

export function WaveformEditor({
  audioUrl,
  currentTime,
  duration,
  markers,
  onSeek,
  onMarkerAdd,
}: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const onSeekRef = useRef(onSeek)
  const onMarkerAddRef = useRef(onMarkerAdd)

  onSeekRef.current = onSeek
  onMarkerAddRef.current = onMarkerAdd

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#b8b8b8',
      progressColor: '#4361ee',
      cursorColor: '#ff4757',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 0,
      height: 88,
      normalize: true,
      interact: true,
    })

    void ws.load(audioUrl)
    ws.on('click', (t) => onSeekRef.current(t))
    ws.on('dblclick', (t) => onMarkerAddRef.current?.(t))

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
    }
  }, [audioUrl])

  useEffect(() => {
    const ws = wsRef.current
    if (!ws || duration <= 0) return
    ws.setTime(currentTime)
  }, [currentTime, duration])

  if (!audioUrl) return null

  return (
    <div className="app-waveform panel-flat p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="app-field-label">
          Dalga formu — tıkla: git, çift tık: işaretle
        </span>
        <span className="font-mono text-[11px] font-bold text-[#666]">
          {formatTime(currentTime)}
        </span>
      </div>
      <div ref={containerRef} className="app-waveform-canvas" />
      {markers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {markers.map((m, i) => (
            <button
              key={`${m}-${i}`}
              type="button"
              onClick={() => onSeek(m)}
              className="app-btn-sm app-btn-secondary-sm"
            >
              {formatTime(m)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
