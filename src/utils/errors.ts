export class AppError extends Error {
  code:
    | 'STORAGE_FULL'
    | 'INVALID_LRC'
    | 'INVALID_AUDIO'
    | 'DB_ERROR'
    | 'IMPORT_FAILED'
    | 'NOT_FOUND'
    | 'UNKNOWN'

  constructor(
    message: string,
    code:
      | 'STORAGE_FULL'
      | 'INVALID_LRC'
      | 'INVALID_AUDIO'
      | 'DB_ERROR'
      | 'IMPORT_FAILED'
      | 'NOT_FOUND'
      | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AppError) return err.message
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    return 'Depolama alanı dolu. Bazı şarkıları silip tekrar dene.'
  }
  if (err instanceof Error) return err.message
  return 'Beklenmeyen bir hata oluştu.'
}

export function parseLrcOrThrow(lrcText: string): void {
  const hasLyrics = lrcText
    .split('\n')
    .some((l) => /^\[\d{1,2}:\d{2}/.test(l.trim()))
  if (!hasLyrics) {
    throw new AppError(
      'LRC dosyasında geçerli zaman damgası bulunamadı.',
      'INVALID_LRC',
    )
  }
}
