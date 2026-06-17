import { useCallback, useEffect, useRef, useState } from 'react'
import { WaveformEditor } from './WaveformEditor'
import type {
  EditorSyncMode,
  LyricLine,
  LyricWord,
  SongInput,
} from '../types/lyrics'
import { autoAlignWords } from '../utils/autoAlign'
import { parseLrcOrThrow } from '../utils/errors'
import { parseLRC, parseLRCMetadata, serializeLRC } from '../utils/lrcParser'
import { formatTime } from '../utils/time'

interface LyricSyncEditorProps {
  initialSong?: SongInput | null
  onSave: (song: SongInput) => void | Promise<void>
}

export function LyricSyncEditor({ initialSong, onSave }: LyricSyncEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [title, setTitle] = useState(initialSong?.title ?? '')
  const [artist, setArtist] = useState(initialSong?.artist ?? '')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(
    initialSong?.audioBlob instanceof File ? initialSong.audioBlob : null,
  )
  const [audioBlob, setAudioBlob] = useState<Blob | null>(
    initialSong?.audioBlob ?? null,
  )
  const [rawLyrics, setRawLyrics] = useState('')
  const [syncedLines, setSyncedLines] = useState<LyricLine[]>([])
  const [syncMode, setSyncMode] = useState<EditorSyncMode>('line')
  const [lineIndex, setLineIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [markers, setMarkers] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const pendingLines = rawLyrics
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const currentLineWords = pendingLines[lineIndex]
    ?.split(/\s+/)
    .filter(Boolean) ?? []

  const linesComplete =
    syncedLines.length === pendingLines.length && pendingLines.length > 0

  useEffect(() => {
    if (!initialSong) return
    const meta = parseLRCMetadata(initialSong.lrc)
    setTitle(meta.ti || initialSong.title)
    setArtist(meta.ar || initialSong.artist)
    const parsed = parseLRC(initialSong.lrc)
    setSyncedLines(parsed)
    setRawLyrics(parsed.map((l) => l.text).join('\n'))
    setLineIndex(parsed.length)
    const url = URL.createObjectURL(initialSong.audioBlob)
    setAudioUrl(url)
    setAudioBlob(initialSong.audioBlob)
    return () => URL.revokeObjectURL(url)
  }, [initialSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isPlaying) return
    let frameId = 0
    const tick = () => {
      setCurrentTime(audio.currentTime)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying])

  const handleAudioUpload = (file: File | null) => {
    if (!file) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioFile(file)
    setAudioBlob(file)
    setAudioUrl(URL.createObjectURL(file))
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  const handleLrcImport = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      parseLrcOrThrow(text)
      const parsed = parseLRC(text)
      const meta = parseLRCMetadata(text)
      setSyncedLines(parsed)
      setRawLyrics(parsed.map((l) => l.text).join('\n'))
      setLineIndex(parsed.length)
      if (meta.ti) setTitle(meta.ti)
      if (meta.ar) setArtist(meta.ar)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'LRC okunamadı')
    }
  }

  const markLine = useCallback(() => {
    if (!audioRef.current || lineIndex >= pendingLines.length) return
    const time = audioRef.current.currentTime
    const text = pendingLines[lineIndex]
    setSyncedLines((prev) => [...prev, { time, text }])
    setLineIndex((i) => i + 1)
    setWordIndex(0)
    setMarkers((m) => [...m, time])
  }, [lineIndex, pendingLines])

  const markWord = useCallback(() => {
    if (!audioRef.current || lineIndex >= syncedLines.length) return
    const time = audioRef.current.currentTime
    const word = currentLineWords[wordIndex]
    if (!word) return

    setSyncedLines((prev) => {
      const next = [...prev]
      const line = { ...next[lineIndex] }
      const words: LyricWord[] = [...(line.words ?? []), { time, text: word }]
      line.words = words
      next[lineIndex] = line
      return next
    })

    const nextWord = wordIndex + 1
    if (nextWord >= currentLineWords.length && lineIndex < syncedLines.length - 1) {
      setLineIndex((i) => i + 1)
      setWordIndex(0)
    } else {
      setWordIndex(nextWord)
    }
    setMarkers((m) => [...m, time])
  }, [lineIndex, syncedLines.length, wordIndex, currentLineWords])

  const handleSpace = useCallback(() => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      void audioRef.current.play()
      setIsPlaying(true)
      return
    }
    if (syncMode === 'line') markLine()
    else markWord()
  }, [syncMode, markLine, markWord])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }
      e.preventDefault()
      handleSpace()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSpace])

  const runAutoAlign = () => {
    if (syncedLines.length === 0) return
    const aligned = autoAlignWords(syncedLines, duration || undefined)
    setSyncedLines(aligned)
    setSyncMode('word')
    setLineIndex(0)
    setWordIndex(0)
  }

  const downloadLrc = () => {
    const lrc = serializeLRC(syncedLines, {
      ti: title || 'Başlıksız',
      ar: artist || 'Bilinmiyor',
    })
    const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'sarki'}.lrc`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    const blob = audioBlob ?? audioFile
    if (!blob || syncedLines.length === 0) return
    const lrc = serializeLRC(syncedLines, {
      ti: title || 'Başlıksız',
      ar: artist || 'Bilinmiyor',
    })
    void onSave({
      id: initialSong?.id ?? crypto.randomUUID(),
      title: title || 'Başlıksız',
      artist: artist || 'Bilinmiyor',
      audioBlob: blob,
      lrc,
      createdAt: initialSong?.createdAt ?? Date.now(),
      backgroundImageBlob: initialSong?.backgroundImageBlob,
      fontFamily: initialSong?.fontFamily,
    })
  }

  const resetSync = () => {
    setSyncedLines([])
    setLineIndex(0)
    setWordIndex(0)
    setMarkers([])
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }

  const inputClass = 'app-input'

  return (
    <div className="space-y-6">
      {error && (
        <div className="app-error">{error}</div>
      )}

      <div className="panel-flat p-6">
        <h2 className="app-editor-title">
          Şarkı Bilgileri
        </h2>
        <p className="app-editor-sub">
          Ses yükle, sözleri gir veya LRC içe aktar
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="app-field-label">
              Başlık
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="app-field-label">
              Sanatçı
            </span>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="app-field-label">
              Ses dosyası
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleAudioUpload(e.target.files?.[0] ?? null)}
              className="app-file"
            />
          </label>
          <label className="block">
            <span className="app-field-label">
              LRC içe aktar
            </span>
            <input
              type="file"
              accept=".lrc,text/plain"
              onChange={(e) => void handleLrcImport(e.target.files?.[0] ?? null)}
              className="app-file"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="app-field-label">
            Sözler (satır satır)
          </span>
          <textarea
            value={rawLyrics}
            onChange={(e) => {
              setRawLyrics(e.target.value)
              if (!initialSong) {
                setSyncedLines([])
                setLineIndex(0)
              }
            }}
            rows={8}
            className={`${inputClass} resize-y`}
            placeholder={'İlk satır\nİkinci satır'}
          />
        </label>
      </div>

      {audioUrl && pendingLines.length > 0 && (
        <div className="panel-flat p-6">
          <WaveformEditor
            audioUrl={audioUrl}
            currentTime={currentTime}
            duration={duration}
            markers={markers}
            onSeek={(t) => {
              if (audioRef.current) {
                audioRef.current.currentTime = t
                setCurrentTime(t)
              }
            }}
            onMarkerAdd={(t) => setMarkers((m) => [...m, t])}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="app-editor-title">
                Eşitleme
              </h3>
              <p className="app-editor-sub">
                <kbd className="app-kbd">Space</kbd> çal / işaretle
              </p>
            </div>
            <div className="mode-toggle">
              <button
                type="button"
                className={syncMode === 'line' ? 'active' : ''}
                onClick={() => setSyncMode('line')}
              >
                Satır
              </button>
              <button
                type="button"
                className={syncMode === 'word' ? 'active' : ''}
                onClick={() => {
                  setSyncMode('word')
                  setLineIndex(0)
                  setWordIndex(0)
                }}
                disabled={!linesComplete}
              >
                Kelime
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const a = audioRef.current
                if (!a) return
                if (a.paused) {
                  void a.play()
                  setIsPlaying(true)
                } else {
                  a.pause()
                  setIsPlaying(false)
                }
              }}
              className="app-btn-sm app-btn-primary-sm"
            >
              {isPlaying ? 'Duraklat' : 'Çal'}
            </button>
            <button
              type="button"
              onClick={syncMode === 'line' ? markLine : markWord}
              className="app-btn-sm app-btn-secondary-sm"
            >
              İşaretle
            </button>
            <button
              type="button"
              onClick={resetSync}
              className="app-btn-sm app-btn-ghost-sm"
            >
              Sıfırla
            </button>
            {linesComplete && (
              <button
                type="button"
                onClick={runAutoAlign}
                className="app-btn-sm app-btn-secondary-sm"
              >
                Otomatik Kelime Hizala
              </button>
            )}
            <span className="ml-auto font-mono text-[11px] font-bold text-[#666]">
              {formatTime(currentTime)}
            </span>
          </div>

          {syncMode === 'line' ? (
            <div className="mt-6 space-y-1">
              {pendingLines.map((line, index) => {
                const synced = syncedLines[index]
                const isCurrent = index === lineIndex
                return (
                  <div
                    key={`${index}-${line}`}
                    className={[
                      'app-line-item',
                      isCurrent ? 'active' : synced ? 'done' : '',
                    ].join(' ')}
                  >
                    <span className="w-14 shrink-0 font-mono text-[10px]">
                      {synced ? formatTime(synced.time) : '--:--'}
                    </span>
                    <span>{line}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-6">
              <p className="app-field-label">
                Satır {lineIndex + 1}: {pendingLines[lineIndex]}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentLineWords.map((w, i) => {
                  const synced = syncedLines[lineIndex]?.words?.[i]
                  const isCurrent = i === wordIndex
                  return (
                    <span
                      key={`${w}-${i}`}
                      className={[
                        'border-[3px] border-[#0d0d0d] px-2 py-1 text-xs font-bold uppercase',
                        isCurrent
                          ? 'bg-[#00ffc8]'
                          : synced
                            ? 'bg-[#eee] text-[#666]'
                            : 'bg-white text-[#999]',
                      ].join(' ')}
                    >
                      {synced ? formatTime(synced.time) : ''} {w}
                    </span>
                  )
                })}
              </div>
              {wordIndex >= currentLineWords.length && lineIndex < syncedLines.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setLineIndex((i) => i + 1)
                    setWordIndex(0)
                  }}
                  className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#0d0d0d]"
                >
                  Sonraki satır →
                </button>
              )}
            </div>
          )}

          {linesComplete && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadLrc}
                className="app-btn-sm app-btn-secondary-sm"
              >
                LRC İndir
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="app-btn-sm app-btn-primary-sm"
              >
                Kaydet
              </button>
            </div>
          )}

          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            preload="metadata"
          />
        </div>
      )}
    </div>
  )
}
