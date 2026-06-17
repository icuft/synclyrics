import { useRef, useState } from 'react'

interface SongImporterProps {
  onImport: (audioFile: File, lrcFile: File) => Promise<void>
}

export function SongImporter({ onImport }: SongImporterProps) {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const lrcInputRef = useRef<HTMLInputElement>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lrcFile, setLrcFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canImport = audioFile !== null && lrcFile !== null && !loading

  const handleImport = async () => {
    if (!audioFile || !lrcFile) return

    setLoading(true)
    setError(null)

    try {
      await onImport(audioFile, lrcFile)
      setAudioFile(null)
      setLrcFile(null)
      if (audioInputRef.current) audioInputRef.current.value = ''
      if (lrcInputRef.current) lrcInputRef.current.value = ''
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Dosyalar yüklenemedi. LRC ve ses dosyasını kontrol et.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-flat p-5">
      <p className="hp-label">İçe aktar</p>
      <h2 className="app-editor-title">Ses + LRC</h2>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="app-field-label">Ses</span>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="app-file"
          />
          {audioFile && (
            <span className="mt-1 block truncate text-[11px] text-[#666]">
              {audioFile.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="app-field-label">LRC</span>
          <input
            ref={lrcInputRef}
            type="file"
            accept=".lrc,text/plain"
            onChange={(e) => setLrcFile(e.target.files?.[0] ?? null)}
            className="app-file"
          />
          {lrcFile && (
            <span className="mt-1 block truncate text-[11px] text-[#666]">
              {lrcFile.name}
            </span>
          )}
        </label>
      </div>

      {error && <p className="mt-3 text-[11px] font-bold text-[#ff4757]">{error}</p>}

      <button
        type="button"
        onClick={handleImport}
        disabled={!canImport}
        className="hp-btn hp-btn-fill mt-4 w-full text-center disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Yükleniyor…' : 'İçe aktar'}
      </button>
    </div>
  )
}
