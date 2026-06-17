import type { SongInput } from '../types/lyrics'
import { parseLRCMetadata } from './lrcParser'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('LRC dosyası okunamadı'))
    reader.readAsText(file, 'UTF-8')
  })
}

export async function createSongFromFiles(
  audioFile: File,
  lrcFile: File,
): Promise<SongInput> {
  const lrc = await readFileAsText(lrcFile)
  const metadata = parseLRCMetadata(lrc)
  const audioName = audioFile.name.replace(/\.[^.]+$/, '')

  return {
    id: crypto.randomUUID(),
    title: metadata.ti || audioName,
    artist: metadata.ar || 'Bilinmiyor',
    audioBlob: audioFile,
    lrc,
    createdAt: Date.now(),
  }
}
