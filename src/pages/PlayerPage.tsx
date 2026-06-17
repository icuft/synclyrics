import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorBanner, useErrorHandler } from '../components/ErrorBanner'
import { FontPicker } from '../components/FontPicker'
import { LyricPlayer } from '../components/LyricPlayer'
import { useAppSettings } from '../hooks/useAppSettings'
import type { SongData, LyricDisplayMode } from '../types/lyrics'
import { AppError } from '../utils/errors'
import { getSongById } from '../utils/storage'

const MODES: { id: LyricDisplayMode; label: string }[] = [
  { id: 'block', label: 'Blok' },
  { id: 'flow', label: 'Akış' },
  { id: 'karaoke', label: 'Karaoke' },
]

export function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [song, setSong] = useState<SongData | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()
  const settings = useAppSettings()

  const autoPlay = searchParams.get('autoplay') === '1'

  useEffect(() => {
    if (!id) {
      navigate('/library')
      return
    }
    void getSongById(id)
      .then((s) => {
        if (!s) throw new AppError('Şarkı bulunamadı.', 'NOT_FOUND')
        setSong(s)
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }, [id, navigate, handleError])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
        <p className="app-loading">Yükleniyor</p>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="app-page">
        <ErrorBanner message={error ?? 'Şarkı bulunamadı'} />
        <Link to="/library" className="app-player-back">
          ← Kütüphane
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#f5f5f0]">
      <ErrorBanner message={error} onDismiss={clearError} />

      <div className="app-player-bar">
        <div className="flex items-center gap-4">
          <Link to="/library" className="app-player-back">
            ← Kütüphane
          </Link>
          <div className="hidden h-5 w-0.5 bg-[#0d0d0d] sm:block" />
          <div className="min-w-0">
            <p className="app-player-title truncate">{song.title}</p>
            <p className="app-player-artist truncate">{song.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="mode-toggle hidden sm:flex">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={settings.displayMode === m.id ? 'active' : ''}
                onClick={() => settings.setDisplayMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className="app-settings-toggle lg:hidden"
          >
            Ayarlar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <main className="flex flex-1 items-center justify-center px-4 py-8 lg:px-10 lg:py-12">
          <LyricPlayer
            song={song}
            autoPlay={autoPlay}
            displayMode={settings.displayMode}
            onDisplayModeChange={settings.setDisplayMode}
            fontFamily={settings.fontFamily}
            onFontChange={settings.setFontFamily}
            onSongUpdate={setSong}
            showModeToggle={false}
          />
        </main>

        <aside
          className={[
            'app-sidebar',
            settingsOpen ? 'block' : 'hidden lg:block',
          ].join(' ')}
        >
          <div className="app-sidebar-inner">
            <h3 className="app-sidebar-title">Görünüm</h3>

            <div className="mb-6 sm:hidden">
              <p className="app-field-label">Mod</p>
              <div className="mode-toggle">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={settings.displayMode === m.id ? 'active' : ''}
                    onClick={() => settings.setDisplayMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <FontPicker
              value={song.fontFamily || settings.fontFamily}
              onChange={settings.setFontFamily}
            />

            <p className="app-sidebar-note">
              Blok modunda kelimeler okundukça tek tek belirir. Henüz söylenmemiş
              kısımlar gizli kalır.
            </p>

            <Link to={`/editor/${song.id}`} className="app-link-btn">
              Sözleri düzenle
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
