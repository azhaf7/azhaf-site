export function getBookTheme(book) {
  return {
    '--paper': book.cover.bg,
    '--paper-deep': `color-mix(in srgb, ${book.cover.bg} 85%, black)`,
    '--ink': book.cover.ink,
    '--ink-soft': `color-mix(in srgb, ${book.cover.ink} 68%, ${book.cover.bg})`,
    '--rule': `color-mix(in srgb, ${book.cover.ink} 25%, transparent)`,
  }
}
