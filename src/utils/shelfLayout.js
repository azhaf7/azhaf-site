import { books } from '../data/books'

// Shared between the catalog and the book that travels off it, so the
// traveling copy is laid out in exactly the same geometry as the one at rest.
export const CATALOG_SCALE = 1.12
export const CATALOG_HEIGHT_SCALE = 1.18
export const CATALOG_DEPTH_SCALE = 0.72

export function catalogBookSize(book) {
  return {
    width: Math.round(book.width * CATALOG_SCALE),
    height: Math.round(book.height * CATALOG_HEIGHT_SCALE),
    depth: Math.max(12, Math.round(book.depth * CATALOG_DEPTH_SCALE)),
  }
}

const HOVER_STYLES = 6

// Each book leans at its own angle on the shelf. Kept here (not in CSS
// nth-child rules) so the copy that travels off the shelf can stand at the
// identical angle and land without a snap.
const REST_POSES = [
  { y: 62, x: 6 },
  { y: 58, x: 5 },
  { y: 64, x: 7 },
]

export function shelfRestVars(index = 0) {
  const pose = REST_POSES[index % REST_POSES.length]
  return { '--rest-y': `${pose.y}deg`, '--rest-x': `${pose.x}deg` }
}

// A book keeps its own lean and hover style wherever it is moved to.
export function bookIndex(slug) {
  return Math.max(0, books.findIndex((entry) => entry.slug === slug))
}

export function shelfSlotVars(book, index) {
  const own = bookIndex(book.slug)
  const size = catalogBookSize(book)
  const spineFacing = Math.round(size.width * 0.38 + size.depth * 0.8)
  return {
    '--slot-w': `${spineFacing + 2}px`,
    '--slot-h': `${size.height}px`,
    '--cover': book.cover?.bg ?? '#1a1a1a',
    '--reveal-i': index,
    '--hover-style': own % HOVER_STYLES,
    ...shelfRestVars(own),
  }
}
