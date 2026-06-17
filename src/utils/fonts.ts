export interface GoogleFontOption {
  id: string
  label: string
  family: string
}

export const GOOGLE_FONTS: GoogleFontOption[] = [
  { id: 'anton', label: 'Anton', family: 'Anton' },
  { id: 'bebas', label: 'Bebas Neue', family: 'Bebas Neue' },
  { id: 'oswald', label: 'Oswald', family: 'Oswald' },
  { id: 'inter', label: 'Inter', family: 'Inter' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto' },
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display' },
  { id: 'syne', label: 'Syne', family: 'Syne' },
]

const loaded = new Set<string>()

export function loadGoogleFont(family: string): void {
  if (loaded.has(family)) return
  loaded.add(family)

  const id = `gf-${family.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700;900&display=swap`
  document.head.appendChild(link)
}

export const DEFAULT_FONT = 'Anton'
