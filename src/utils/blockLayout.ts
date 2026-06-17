export type BlockTier = 'xl' | 'lg' | 'md' | 'sm'

export interface BlockRow {
  wordIndices: number[]
  tier: BlockTier
}

const TIER_PATTERN: BlockTier[] = ['xl', 'md', 'xl', 'sm']

export function splitIntoBlockRows(wordCount: number): BlockRow[] {
  if (wordCount <= 0) return []
  if (wordCount === 1) return [{ wordIndices: [0], tier: 'xl' }]

  const rowCount = Math.min(4, Math.max(2, Math.ceil(wordCount / 2)))
  const rows: BlockRow[] = []
  let wordIdx = 0

  for (let r = 0; r < rowCount; r++) {
    const remaining = wordCount - wordIdx
    const rowsLeft = rowCount - r
    const take = Math.ceil(remaining / rowsLeft)
    const indices = Array.from({ length: take }, (_, i) => wordIdx + i)
    wordIdx += take
    rows.push({
      wordIndices: indices,
      tier: TIER_PATTERN[r % TIER_PATTERN.length],
    })
  }

  return rows
}

export const BLOCK_TIER_CLASS: Record<BlockTier, string> = {
  xl: 'block-tier-xl',
  lg: 'block-tier-lg',
  md: 'block-tier-md',
  sm: 'block-tier-sm',
}
