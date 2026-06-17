export interface LyricWord {
  time: number
  text: string
}

export interface LyricLine {
  time: number
  text: string
  words?: LyricWord[]
}

export interface ProcessedLyricLine extends LyricLine {
  words: LyricWord[]
}

export interface SongData {
  id: string
  title: string
  artist: string
  audioUrl: string
  lrc: string
  createdAt: number
  backgroundImageUrl?: string
  fontFamily?: string
}

export interface SongInput {
  id: string
  title: string
  artist: string
  lrc: string
  audioBlob: Blob
  createdAt: number
  backgroundImageBlob?: Blob
  fontFamily?: string
}

export type LyricDisplayMode = 'block' | 'flow' | 'karaoke'
export type LibrarySort = 'newest' | 'oldest' | 'title' | 'artist'
export type EditorSyncMode = 'line' | 'word'
