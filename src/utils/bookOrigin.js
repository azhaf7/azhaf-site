let stored = null

// Remembered on click so a deep link (no shelf behind it) can skip the lift.
export function rememberBookOrigin(slug, element) {
  if (!element) return
  const rect = element.getBoundingClientRect()
  stored = { slug, left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

export function peekBookOrigin(slug) {
  if (!stored || stored.slug !== slug) return null
  return stored
}

export function clearBookOrigin() {
  stored = null
}

function catalogBookEl(slug) {
  const item = document.querySelector(`[data-shelf-item="${slug}"]`)
  if (!(item instanceof HTMLElement)) return null
  const target = item.querySelector('.book, .shelf__slot')
  return target instanceof HTMLElement ? target : item
}

// The catalog cover the book sits in, measured live so the trip still lands
// after a resize or zoom.
export function measureShelfItem(slug) {
  const target = catalogBookEl(slug)
  if (!target) return null
  const rect = target.getBoundingClientRect()
  if (!rect.width || !rect.height || !target.offsetWidth || !target.offsetHeight) return null
  return {
    left: rect.left,
    top: rect.top,
    scale: rect.width / target.offsetWidth,
    naturalWidth: target.offsetWidth,
    naturalHeight: target.offsetHeight,
  }
}

export function focusShelfBook(slug) {
  const link = document.querySelector(`[data-book="${slug}"]`)
  if (link instanceof HTMLElement) {
    link.focus({ preventScroll: true })
    return true
  }
  return false
}

export function shelfPose(item) {
  return `translate(${item.left}px, ${item.top}px) scale(${item.scale})`
}

export function facingPose(item, book, coverRect) {
  if (!coverRect?.width || !coverRect?.height || !item.naturalWidth || !item.naturalHeight) {
    return null
  }
  const scale = Math.min(
    coverRect.width / item.naturalWidth,
    coverRect.height / item.naturalHeight,
  )
  const left = coverRect.left + (coverRect.width - item.naturalWidth * scale) / 2
  const top = coverRect.top + (coverRect.height - item.naturalHeight * scale) / 2
  return `translate(${left}px, ${top}px) scale(${scale})`
}
