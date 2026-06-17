import { GOOGLE_FONTS } from '../utils/fonts'

interface FontPickerProps {
  value: string
  onChange: (family: string) => void
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  return (
    <label className="block">
      <span className="app-field-label">Yazı fontu</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="app-select"
        style={{ fontFamily: value }}
      >
        {GOOGLE_FONTS.map((f) => (
          <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  )
}
