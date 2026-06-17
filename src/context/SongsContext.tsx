import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SongData, SongInput } from '../types/lyrics'
import {
  addSong,
  deleteSong,
  deleteSongs,
  loadSongs,
  updateSong,
} from '../utils/storage'

interface SongsContextValue {
  songs: SongData[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  saveSong: (song: SongInput) => Promise<SongData>
  updateExisting: (song: SongInput) => Promise<void>
  removeSong: (id: string) => Promise<void>
  removeMany: (ids: string[]) => Promise<void>
  clearError: () => void
}

const SongsContext = createContext<SongsContextValue | null>(null)

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<SongData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await loadSongs()
      setSongs(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şarkılar yüklenemedi')
    }
  }, [])

  useEffect(() => {
    void refresh().finally(() => setLoading(false))
  }, [refresh])

  const saveSong = async (song: SongInput) => {
    const list = await addSong(song)
    setSongs(list)
    return list.find((s) => s.id === song.id)!
  }

  const updateExisting = async (song: SongInput) => {
    const list = await updateSong(song)
    setSongs(list)
  }

  const removeSong = async (id: string) => {
    const list = await deleteSong(id)
    setSongs(list)
  }

  const removeMany = async (ids: string[]) => {
    const list = await deleteSongs(ids)
    setSongs(list)
  }

  const value = useMemo(
    () => ({
      songs,
      loading,
      error,
      refresh,
      saveSong,
      updateExisting,
      removeSong,
      removeMany,
      clearError: () => setError(null),
    }),
    [songs, loading, error, refresh],
  )

  return (
    <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
  )
}

export function useSongs() {
  const ctx = useContext(SongsContext)
  if (!ctx) throw new Error('useSongs must be used within SongsProvider')
  return ctx
}
