import { FLOWER_KINDS } from '../components/Flower'
import { books } from './books'

const ivory = {
  bg: '#F4F1E8',
  ink: '#0C11A9',
  accent: '#0C11A9',
  spine: '#E6E1D4',
}

const navy = {
  bg: '#070B62',
  ink: '#FFFFFF',
  accent: '#FFFFFF',
  spine: '#050848',
}

const maroon = {
  bg: '#7A1E38',
  ink: '#F4F1E8',
  accent: '#F4F1E8',
  spine: '#641830',
}

const blush = {
  bg: '#F4C9D6',
  ink: '#0C11A9',
  accent: '#0C11A9',
  spine: '#E8B4C4',
}

const sage = {
  bg: '#2F5D50',
  ink: '#F4F1E8',
  accent: '#F4F1E8',
  spine: '#244A40',
}

const mustard = {
  bg: '#C89416',
  ink: '#1E1D1A',
  accent: '#1E1D1A',
  spine: '#A87A12',
}

const night = {
  bg: '#141414',
  ink: '#F4F1E8',
  accent: '#F4F1E8',
  spine: '#0A0A0A',
}

const terracotta = {
  bg: '#A64E3D',
  ink: '#F4F1E8',
  accent: '#F4F1E8',
  spine: '#8A3E30',
}

const teal = {
  bg: '#15565B',
  ink: '#F4F1E8',
  accent: '#F4F1E8',
  spine: '#104448',
}

export const COVER_LOOKS = [
  { id: 'ivory', label: 'Ivory', flower: 'sunflower', cover: ivory },
  {
    id: 'garden',
    label: 'Garden',
    flower: 'blossom',
    covers: [ivory, navy, maroon, blush, sage, mustard, night, terracotta, teal],
  },
  { id: 'navy', label: 'Navy', flower: 'daisy', cover: navy },
  { id: 'blush', label: 'Blush', flower: 'poppy', cover: blush },
  { id: 'night', label: 'Night', flower: 'daisy', cover: night },
]

export function wrapLookIndex(index) {
  const count = COVER_LOOKS.length
  return ((index % count) + count) % count
}

export function dressBook(book, lookIndex) {
  if (book.coverImage) return book
  const look = COVER_LOOKS[wrapLookIndex(lookIndex)]
  const bookIndex = Math.max(
    0,
    books.findIndex((item) => item.slug === book.slug),
  )
  const cover = look.covers ? look.covers[bookIndex % look.covers.length] : look.cover
  const baseFlower = FLOWER_KINDS.indexOf(book.flower)
  const from = baseFlower >= 0 ? baseFlower : bookIndex
  const flower = FLOWER_KINDS[(from + wrapLookIndex(lookIndex)) % FLOWER_KINDS.length]

  return {
    ...book,
    cover,
    flower: visibleFlower(cover.bg, flower),
  }
}

function hexLuma(hex) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return 0.5
  const r = Number.parseInt(raw.slice(0, 2), 16) / 255
  const g = Number.parseInt(raw.slice(2, 4), 16) / 255
  const b = Number.parseInt(raw.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const LIGHT_FLOWERS = new Set(['daisy', 'lily', 'blossom'])
const ON_LIGHT = ['poppy', 'sunflower', 'cosmos', 'tulip', 'hibiscus']
const ON_DARK_RED = new Set(['poppy', 'hibiscus', 'tulip'])

export function visibleFlower(bg, kind) {
  const luma = hexLuma(bg)
  const lightBg = luma > 0.58
  if (lightBg && LIGHT_FLOWERS.has(kind)) {
    return ON_LIGHT[Math.max(0, FLOWER_KINDS.indexOf(kind)) % ON_LIGHT.length]
  }
  if (kind === 'marigold' && luma > 0.42 && luma < 0.7) return 'cosmos'
  if (kind === 'sunflower' && luma > 0.42 && luma < 0.7) return 'poppy'
  if (!lightBg && luma < 0.28 && ON_DARK_RED.has(kind)) return 'daisy'
  if (kind === 'blossom' && luma > 0.5) return 'poppy'
  if (kind === 'hibiscus' && luma > 0.5) return 'sunflower'
  return kind
}

export const SECTION_LOOKS = [
  {
    id: 'default',
    label: 'Default',
    bg: 'transparent',
    heading: '#ffffff',
    ink: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.58)',
    line: 'rgba(255, 255, 255, 0.16)',
  },
  {
    id: 'ivory',
    label: 'Ivory',
    flower: 'sunflower',
    bg: '#F4F1E8',
    heading: '#0C11A9',
    ink: '#0C11A9',
    muted: 'rgba(12, 17, 169, 0.55)',
    line: 'rgba(12, 17, 169, 0.18)',
  },
  {
    id: 'blush',
    label: 'Blush',
    flower: 'poppy',
    bg: '#F4C9D6',
    heading: '#0C11A9',
    ink: '#0C11A9',
    muted: 'rgba(12, 17, 169, 0.55)',
    line: 'rgba(12, 17, 169, 0.18)',
  },
  {
    id: 'maroon',
    label: 'Maroon',
    flower: 'daisy',
    bg: '#7A1E38',
    heading: '#F4F1E8',
    ink: '#F4F1E8',
    muted: 'rgba(244, 241, 232, 0.62)',
    line: 'rgba(244, 241, 232, 0.22)',
  },
  {
    id: 'sage',
    label: 'Sage',
    flower: 'sunflower',
    bg: '#2F5D50',
    heading: '#F4F1E8',
    ink: '#F4F1E8',
    muted: 'rgba(244, 241, 232, 0.62)',
    line: 'rgba(244, 241, 232, 0.22)',
  },
  {
    id: 'mustard',
    label: 'Mustard',
    flower: 'cosmos',
    bg: '#C89416',
    heading: '#1E1D1A',
    ink: '#1E1D1A',
    muted: 'rgba(30, 29, 26, 0.58)',
    line: 'rgba(30, 29, 26, 0.2)',
  },
]

export const SECTION_IDS = ['about', 'hobbies', 'contact']

export function wrapSectionIndex(index) {
  const count = SECTION_LOOKS.length
  return ((index % count) + count) % count
}

export function sectionLookVars(look) {
  return {
    '--section-bg': look.bg,
    '--section-heading': look.heading,
    '--section-ink': look.ink,
    '--section-muted': look.muted,
    '--section-line': look.line,
  }
}
