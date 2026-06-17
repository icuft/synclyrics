import type { SongData, SongInput } from '../types/lyrics'
import {
  deleteSongFromDb,
  getAllSongsFromDb,
  getSongFromDb,
  migrateFromLocalStorage,
  putSongInDb,
} from './audioDb'
import { AppError } from './errors'

const blobUrlCache = new Map<string, string>()
const bgUrlCache = new Map<string, string>()
const bgBlobRefCache = new Map<string, Blob>()

function cacheAudioUrl(id: string, blob: Blob): string {
  let url = blobUrlCache.get(id)
  if (!url) {
    url = URL.createObjectURL(blob)
    blobUrlCache.set(id, url)
  }
  return url
}

function setBgUrl(id: string, blob: Blob): string {
  const key = `${id}-bg`
  const prevUrl = bgUrlCache.get(key)
  if (prevUrl) {
    URL.revokeObjectURL(prevUrl)
  }
  const url = URL.createObjectURL(blob)
  bgUrlCache.set(key, url)
  bgBlobRefCache.set(key, blob)
  return url
}

function getBgUrl(id: string, blob: Blob): string {
  const key = `${id}-bg`
  const cachedBlob = bgBlobRefCache.get(key)
  const cachedUrl = bgUrlCache.get(key)
  if (cachedUrl && cachedBlob === blob) {
    return cachedUrl
  }
  return setBgUrl(id, blob)
}

function toSongData(stored: SongInput & { id: string }): SongData {
  const audioUrl = cacheAudioUrl(stored.id, stored.audioBlob)

  let backgroundImageUrl: string | undefined
  if (stored.backgroundImageBlob) {
    backgroundImageUrl = getBgUrl(stored.id, stored.backgroundImageBlob)
  }

  return {
    id: stored.id,
    title: stored.title,
    artist: stored.artist,
    lrc: stored.lrc,
    createdAt: stored.createdAt,
    audioUrl,
    backgroundImageUrl,
    fontFamily: stored.fontFamily,
  }
}

function revokeAudioCache(id: string): void {
  const audio = blobUrlCache.get(id)
  if (audio) {
    URL.revokeObjectURL(audio)
    blobUrlCache.delete(id)
  }
}

function revokeBgCache(id: string): void {
  const key = `${id}-bg`
  const bg = bgUrlCache.get(key)
  if (bg) {
    URL.revokeObjectURL(bg)
    bgUrlCache.delete(key)
  }
  bgBlobRefCache.delete(key)
}

function revokeCaches(id: string): void {
  revokeAudioCache(id)
  revokeBgCache(id)
}

export type LibrarySort = 'newest' | 'oldest' | 'title' | 'artist'

export function sortSongs(songs: SongData[], sort: LibrarySort): SongData[] {
  const copy = [...songs]
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => a.createdAt - b.createdAt)
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
    case 'artist':
      return copy.sort((a, b) => a.artist.localeCompare(b.artist, 'tr'))
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt)
  }
}

export function filterSongs(songs: SongData[], query: string): SongData[] {
  const q = query.trim().toLowerCase()
  if (!q) return songs
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q),
  )
}

export async function loadSongs(): Promise<SongData[]> {
  await migrateFromLocalStorage()
  const stored = await getAllSongsFromDb()
  return stored
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toSongData)
}

export async function getSongById(id: string): Promise<SongData | null> {
  await migrateFromLocalStorage()
  const stored = await getSongFromDb(id)
  return stored ? toSongData(stored) : null
}

export async function getSongInputById(id: string): Promise<SongInput | null> {
  await migrateFromLocalStorage()
  const stored = await getSongFromDb(id)
  return stored ?? null
}

export async function addSong(song: SongInput): Promise<SongData[]> {
  try {
    await putSongInDb(song)
    return loadSongs()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new AppError('Depolama alanı dolu.', 'STORAGE_FULL')
    }
    throw err
  }
}

export async function updateSong(song: SongInput): Promise<SongData[]> {
  try {
    await putSongInDb(song)
    if (song.backgroundImageBlob) {
      setBgUrl(song.id, song.backgroundImageBlob)
    } else {
      revokeBgCache(song.id)
    }
    return loadSongs()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new AppError('Depolama alanı dolu.', 'STORAGE_FULL')
    }
    throw err
  }
}

export async function updateSongBackground(
  songId: string,
  blob: Blob,
): Promise<string> {
  const stored = await getSongFromDb(songId)
  if (!stored) throw new AppError('Şarkı bulunamadı.', 'NOT_FOUND')

  await putSongInDb({ ...stored, backgroundImageBlob: blob })
  return setBgUrl(songId, blob)
}

export async function deleteSong(id: string): Promise<SongData[]> {
  revokeCaches(id)
  await deleteSongFromDb(id)
  return loadSongs()
}

export async function deleteSongs(ids: string[]): Promise<SongData[]> {
  for (const id of ids) revokeCaches(id)
  for (const id of ids) await deleteSongFromDb(id)
  return loadSongs()
}
