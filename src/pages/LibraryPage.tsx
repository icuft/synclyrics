import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorBanner, useErrorHandler } from '../components/ErrorBanner'
import { SongImporter } from '../components/SongImporter'
import { useSongs } from '../context/SongsContext'
import type { LibrarySort } from '../types/lyrics'
import { createSongFromFiles } from '../utils/importSong'
import { filterSongs, sortSongs } from '../utils/storage'

export function LibraryPage() {
  const { songs, loading, removeSong, removeMany, saveSong } = useSongs()
  const navigate = useNavigate()
  const { error, handleError, clearError } = useErrorHandler()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<LibrarySort>('newest')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const f = filterSongs(songs, query)
    return sortSongs(f, sort)
  }, [songs, query, sort])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = async (audioFile: File, lrcFile: File) => {
    try {
      const song = await createSongFromFiles(audioFile, lrcFile)
      await saveSong(song)
      navigate(`/play/${song.id}?autoplay=1`)
    } catch (err) {
      handleError(err)
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    try {
      await removeMany([...selected])
      setSelected(new Set())
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div className="app-page">
      <ErrorBanner message={error} onDismiss={clearError} />

      <div className="app-page-head">
        <div>
          <p className="hp-label">Kütüphane</p>
          <h1 className="hp-heading">Şarkıların</h1>
          <p className="app-muted">{songs.length} kayıt</p>
        </div>
        <Link to="/editor" className="hp-btn hp-btn-fill">
          + Yeni eşitle
        </Link>
      </div>

      <div className="app-grid-layout">
        <aside>
          <SongImporter onImport={handleImport} />
        </aside>

        <div>
          <div className="app-toolbar">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara…"
              className="app-input"
              style={{ flex: '1 1 200px' }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as LibrarySort)}
              className="app-select"
              style={{ flex: '0 0 auto', width: 'auto', minWidth: '140px' }}
            >
              <option value="newest">En yeni</option>
              <option value="oldest">En eski</option>
              <option value="title">Başlık</option>
              <option value="artist">Sanatçı</option>
            </select>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => void handleBulkDelete()}
                className="app-btn-sm app-btn-danger-sm"
              >
                Sil ({selected.size})
              </button>
            )}
          </div>

          {loading ? (
            <p className="app-loading">Yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <div className="app-empty-box">
              {query ? 'Sonuç bulunamadı' : 'Henüz şarkı yok'}
            </div>
          ) : (
            <div className="app-song-grid">
              {filtered.map((song) => (
                <div key={song.id} className="app-song-cell">
                  <input
                    type="checkbox"
                    checked={selected.has(song.id)}
                    onChange={() => toggleSelect(song.id)}
                    className="app-song-check"
                  />
                  <Link to={`/play/${song.id}`}>
                    <span className="app-song-cell-title">{song.title}</span>
                    <span className="app-song-cell-artist">{song.artist}</span>
                  </Link>
                  <div className="app-song-cell-actions">
                    <Link to={`/editor/${song.id}`}>Düzenle</Link>
                    <button
                      type="button"
                      onClick={() => void removeSong(song.id).catch(handleError)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
