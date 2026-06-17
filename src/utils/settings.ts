import type { LyricDisplayMode } from '../types/lyrics'
import { DEFAULT_FONT } from './fonts'

const DISPLAY_MODE_KEY = 'synclyrics-display-mode'
const FONT_KEY = 'synclyrics-font'

export function loadDisplayMode(): LyricDisplayMode {
  const v = localStorage.getItem(DISPLAY_MODE_KEY)
  if (v === 'flow' || v === 'karaoke') return v
  return 'block'
}

export function saveDisplayMode(mode: LyricDisplayMode): void {
  localStorage.setItem(DISPLAY_MODE_KEY, mode)
}

export function loadFontFamily(): string {
  return localStorage.getItem(FONT_KEY) || DEFAULT_FONT
}

export function saveFontFamily(family: string): void {
  localStorage.setItem(FONT_KEY, family)
}
