import { useEffect, useState } from 'react'
import { loadGoogleFont } from '../utils/fonts'
import {
  loadDisplayMode,
  loadFontFamily,
  saveDisplayMode,
  saveFontFamily,
} from '../utils/settings'
import type { LyricDisplayMode } from '../types/lyrics'

export function useAppSettings() {
  const [displayMode, setDisplayModeState] =
    useState<LyricDisplayMode>(loadDisplayMode)
  const [fontFamily, setFontFamilyState] = useState(loadFontFamily)

  useEffect(() => {
    loadGoogleFont(fontFamily)
  }, [fontFamily])

  const setDisplayMode = (mode: LyricDisplayMode) => {
    setDisplayModeState(mode)
    saveDisplayMode(mode)
  }

  const setFontFamily = (family: string) => {
    loadGoogleFont(family)
    setFontFamilyState(family)
    saveFontFamily(family)
  }

  return { displayMode, setDisplayMode, fontFamily, setFontFamily }
}
