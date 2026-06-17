import type { SongInput } from '../types/lyrics'
import { AppError } from './errors'

const DB_NAME = 'synclyrics'
const DB_VERSION = 1
const STORE = 'songs'
const LEGACY_STORAGE_KEY = 'synced-lyrics-songs'

export interface StoredSong extends SongInput {
  id: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () =>
      reject(new AppError('Veritabanı açılamadı.', 'DB_ERROR'))
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const store = tx.objectStore(STORE)
        const request = fn(store)

        request.onerror = () =>
          reject(new AppError('Veritabanı işlemi başarısız.', 'DB_ERROR'))
        request.onsuccess = () => resolve(request.result)

        tx.onerror = () =>
          reject(new AppError('Veritabanı işlemi başarısız.', 'DB_ERROR'))
      }),
  )
}

export async function getAllSongsFromDb(): Promise<StoredSong[]> {
  return runTransaction('readonly', (store) => store.getAll())
}

export async function getSongFromDb(id: string): Promise<StoredSong | undefined> {
  return runTransaction('readonly', (store) => store.get(id))
}

export async function putSongInDb(song: StoredSong): Promise<void> {
  await runTransaction('readwrite', (store) => store.put(song))
}

export async function deleteSongFromDb(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id))
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function migrateFromLocalStorage(): Promise<void> {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return

  try {
    const legacy = JSON.parse(raw) as Array<{
      id: string
      title: string
      artist: string
      audioUrl: string
      lrc: string
      createdAt: number
    }>

    for (const song of legacy) {
      const audioBlob = await dataUrlToBlob(song.audioUrl)
      await putSongInDb({
        id: song.id,
        title: song.title,
        artist: song.artist,
        lrc: song.lrc,
        audioBlob,
        createdAt: song.createdAt,
      })
    }

    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // ignore
  }
}
