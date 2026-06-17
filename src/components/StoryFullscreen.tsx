import type { LyricDisplayMode, SongData } from '../types/lyrics'
import { LyricDisplay } from './LyricDisplay'

interface StoryFullscreenProps {
  song: SongData
  lines: ReturnType<typeof import('../utils/lrcParser').parseLRC>
  currentTime: number
  duration: number
  displayMode: LyricDisplayMode
  fontFamily: string
  isPlaying: boolean
  onClose: () => void
  onTogglePlay: () => void
}

export function StoryFullscreen({
  song,
  lines,
  currentTime,
  duration,
  displayMode,
  fontFamily,
  isPlaying,
  onClose,
  onTogglePlay,
}: StoryFullscreenProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {song.backgroundImageUrl ? (
        <>
          <img
            src={song.backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#0a0a0a]" />
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              {song.title}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-white/40">
              {song.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-white/30 px-3 py-1 text-[10px] uppercase tracking-wider text-white"
          >
            Kapat
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <LyricDisplay
            mode={displayMode}
            lines={lines}
            currentTime={currentTime}
            songDuration={duration}
            fontFamily={fontFamily}
          />
        </div>

        <div className="px-5 pb-8">
          <div className="mb-4 h-px bg-white/20">
            <div className="h-px bg-white" style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            onClick={onTogglePlay}
            className="mx-auto flex h-12 w-12 items-center justify-center bg-white text-black"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
        </div>
      </div>
    </div>
  )
}
