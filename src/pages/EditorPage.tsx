import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorBanner, useErrorHandler } from '../components/ErrorBanner'
import { LyricSyncEditor } from '../components/LyricSyncEditor'
import { useSongs } from '../context/SongsContext'
import type { SongInput } from '../types/lyrics'
import { getSongInputById } from '../utils/storage'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { saveSong, updateExisting } = useSongs()
  const { error, handleError, clearError } = useErrorHandler()
  const [initial, setInitial] = useState<SongInput | null>(null)
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) {
      setInitial(null)
      setLoading(false)
      return
    }
    void getSongInputById(id)
      .then((s) => setInitial(s))
      .catch(handleError)
      .finally(() => setLoading(false))
  }, [id, handleError])

  const handleSave = async (song: SongInput) => {
    try {
      if (id) {
        await updateExisting(song)
      } else {
        await saveSong(song)
      }
      navigate(`/play/${song.id}?autoplay=1`)
    } catch (err) {
      handleError(err)
    }
  }

  if (loading) {
    return <div className="app-loading">Yükleniyor…</div>
  }

  return (
    <div className="app-page">
      <ErrorBanner message={error} onDismiss={clearError} />
      <div className="mb-8">
        <p className="hp-label">Editör</p>
        <h1 className="hp-heading">
          {id ? 'Şarkıyı düzenle' : 'Yeni şarkı eşitle'}
        </h1>
        <p className="app-muted">Satır · kelime · waveform · LRC</p>
      </div>
      <LyricSyncEditor initialSong={initial} onSave={handleSave} />
    </div>
  )
}
