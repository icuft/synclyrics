import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { FontPicker } from './FontPicker'
import { LyricDisplay } from './LyricDisplay'
import { StoryFullscreen } from './StoryFullscreen'
import type { LyricDisplayMode, SongData } from '../types/lyrics'
import { parseLRC } from '../utils/lrcParser'
import { formatTime } from '../utils/time'
import { getSongInputById, updateSong, updateSongBackground } from '../utils/storage'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5]

interface LyricPlayerProps {
  song: SongData | null
  autoPlay?: boolean
  displayMode: LyricDisplayMode
  onDisplayModeChange: (m: LyricDisplayMode) => void
  fontFamily: string
  onFontChange: (f: string) => void
  onSongUpdate?: (song: SongData) => void
  showModeToggle?: boolean
  exposeRef?: RefObject<{
    currentTime: number
    duration: number
    isPlaying: boolean
    togglePlay: () => void
  } | null>
}

export function LyricPlayer({
  song,
  autoPlay = false,
  displayMode,
  onDisplayModeChange,
  fontFamily,
  onFontChange,
  onSongUpdate,
  showModeToggle = true,
  exposeRef,
}: LyricPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loopA, setLoopA] = useState<number | null>(null)
  const [loopB, setLoopB] = useState<number | null>(null)
  const [storyOpen, setStoryOpen] = useState(false)
  const [showExtras, setShowExtras] = useState(false)
  const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(
    song?.backgroundImageUrl,
  )
  const bgUploadGenRef = useRef(0)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const lines = useMemo(
    () => (song ? parseLRC(song.lrc) : []),
    [song?.lrc],
  )

  const effectiveFont = song?.fontFamily || fontFamily

  useEffect(() => {
    setBackgroundUrl(song?.backgroundImageUrl)
  }, [song?.id])

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    setLoopA(null)
    setLoopB(null)
  }, [song?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = speed
  }, [speed, song?.id])

  useEffect(() => {
    if (!autoPlay || !song) return
    const audio = audioRef.current
    if (!audio) return

    const start = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        // ignore
      }
    }

    if (audio.readyState >= 1) void start()
    else audio.addEventListener('loadedmetadata', () => void start(), { once: true })
  }, [song?.id, autoPlay])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  useImperativeHandle(exposeRef, () => ({
    currentTime,
    duration,
    isPlaying,
    togglePlay,
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isPlaying) return

    let frameId = 0
    const tick = () => {
      const t = audio.currentTime
      setCurrentTime(t)

      if (loopA !== null && loopB !== null && loopB > loopA && t >= loopB) {
        audio.currentTime = loopA
      }

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, song?.id, loopA, loopB])

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  const preservePlayback = (time: number, playing: boolean) => {
    requestAnimationFrame(() => {
      const audio = audioRef.current
      if (!audio) return
      if (Math.abs(audio.currentTime - time) > 0.25) {
        audio.currentTime = time
        setCurrentTime(time)
      }
      if (playing && audio.paused) {
        void audio.play().then(() => setIsPlaying(true))
      }
    })
  }

  const handleBackgroundUpload = async (file: File | null) => {
    if (!file || !song) return

    const gen = ++bgUploadGenRef.current

    const audio = audioRef.current
    const savedTime = audio?.currentTime ?? currentTime
    const wasPlaying = audio ? !audio.paused : isPlaying

    // Önizleme — anında göster
    const previewUrl = URL.createObjectURL(file)
    setBackgroundUrl(previewUrl)

    try {
      const canonicalUrl = await updateSongBackground(song.id, file)

      if (gen !== bgUploadGenRef.current) {
        URL.revokeObjectURL(previewUrl)
        return
      }

      URL.revokeObjectURL(previewUrl)
      setBackgroundUrl(canonicalUrl)
      onSongUpdate?.({
        ...song,
        backgroundImageUrl: canonicalUrl,
        audioUrl: song.audioUrl,
      })
      preservePlayback(savedTime, wasPlaying)
    } catch {
      if (gen === bgUploadGenRef.current) {
        URL.revokeObjectURL(previewUrl)
        setBackgroundUrl(song.backgroundImageUrl)
      }
    } finally {
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
  }

  const handleFontSave = async (family: string) => {
    onFontChange(family)
    if (!song) return

    const audio = audioRef.current
    const savedTime = audio?.currentTime ?? currentTime
    const wasPlaying = audio ? !audio.paused : isPlaying

    const input = await getSongInputById(song.id)
    if (!input) return

    await updateSong({ ...input, fontFamily: family })
    onSongUpdate?.({ ...song, fontFamily: family, audioUrl: song.audioUrl })

    preservePlayback(savedTime, wasPlaying)
  }

  if (!song) {
    return (
      <div className="app-player app-player-empty">
        <p>Şarkı seçilmedi</p>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      <div className="app-player">
        <div
          className="app-player-stage"
          style={
            backgroundUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(245,245,240,0.82), rgba(245,245,240,0.9)), url(${backgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          {showModeToggle && (
            <div className="absolute right-4 top-4 z-10 mode-toggle">
              {(['block', 'flow', 'karaoke'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={displayMode === m ? 'active' : ''}
                  onClick={() => onDisplayModeChange(m)}
                >
                  {m === 'block' ? 'Blok' : m === 'flow' ? 'Akış' : 'Karaoke'}
                </button>
              ))}
            </div>
          )}

          <LyricDisplay
            mode={displayMode}
            lines={lines}
            currentTime={currentTime}
            songDuration={duration}
            fontFamily={effectiveFont}
            theme="light"
          />
        </div>

        <div className="app-player-controls">
          <div className="app-player-progress">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="app-range w-full"
            />
            <div className="app-player-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="app-player-transport">
            <button
              type="button"
              onClick={() => handleSeek(Math.max(0, currentTime - 5))}
              className="app-player-skip"
              aria-label="5 saniye geri"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="app-player-play"
              aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(Math.min(duration, currentTime + 5))}
              className="app-player-skip"
              aria-label="5 saniye ileri"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </button>
          </div>

          <div className="app-player-toolbar">
            <div className="flex items-center gap-2">
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="app-select app-select-inline"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}x
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setStoryOpen(true)}
                className="app-player-link"
              >
                Story
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowExtras((e) => !e)}
              className="app-player-link"
            >
              {showExtras ? 'Gizle' : 'Daha fazla'}
            </button>
          </div>

          {showExtras && (
            <div className="app-player-extras">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLoopA(currentTime)}
                  className="app-btn-sm app-btn-secondary-sm"
                >
                  A {loopA !== null ? formatTime(loopA) : '—'}
                </button>
                <button
                  type="button"
                  onClick={() => setLoopB(currentTime)}
                  className="app-btn-sm app-btn-secondary-sm"
                >
                  B {loopB !== null ? formatTime(loopB) : '—'}
                </button>
                {(loopA !== null || loopB !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoopA(null)
                      setLoopB(null)
                    }}
                    className="app-btn-sm app-btn-ghost-sm"
                  >
                    Döngü kapat
                  </button>
                )}
              </div>

              <label className="block">
                <span className="app-field-label">Arka plan</span>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void handleBackgroundUpload(e.target.files?.[0] ?? null)
                  }
                  className="app-file"
                />
              </label>

              <FontPicker
                value={effectiveFont}
                onChange={(f) => void handleFontSave(f)}
              />
            </div>
          )}

          <div className="app-player-bar">
            <div className="app-player-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={song.audioUrl}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {storyOpen && (
        <StoryFullscreen
          song={{ ...song, backgroundImageUrl: backgroundUrl }}
          lines={lines}
          currentTime={currentTime}
          duration={duration}
          displayMode={displayMode}
          fontFamily={effectiveFont}
          isPlaying={isPlaying}
          onClose={() => setStoryOpen(false)}
          onTogglePlay={togglePlay}
        />
      )}
    </>
  )
}
