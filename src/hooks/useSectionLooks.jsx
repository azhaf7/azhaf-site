import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SECTION_IDS, SECTION_LOOKS, wrapSectionIndex } from '../data/looks'

const STORAGE_KEY = 'azhaf-press-sections'
const SectionLooksContext = createContext(null)

function emptyMap() {
  return Object.fromEntries(SECTION_IDS.map((id) => [id, 0]))
}

function readSavedMap() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.fromEntries(
      SECTION_IDS.map((id) => [id, wrapSectionIndex(Number(saved[id]) || 0)]),
    )
  } catch {
    return emptyMap()
  }
}

function persistMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota / private mode */
  }
}

export function SectionLooksProvider({ children }) {
  const [indexes, setIndexes] = useState(readSavedMap)

  const cycleSection = useCallback((id) => {
    setIndexes((current) => {
      const next = {
        ...current,
        [id]: wrapSectionIndex((current[id] ?? 0) + 1),
      }
      persistMap(next)
      return next
    })
  }, [])

  const resetSections = useCallback(() => {
    const next = emptyMap()
    persistMap(next)
    setIndexes(next)
  }, [])

  const lookFor = useCallback(
    (id) => SECTION_LOOKS[wrapSectionIndex(indexes[id] ?? 0)],
    [indexes],
  )

  const value = useMemo(
    () => ({ cycleSection, lookFor, resetSections }),
    [cycleSection, lookFor, resetSections],
  )

  return (
    <SectionLooksContext.Provider value={value}>{children}</SectionLooksContext.Provider>
  )
}

export function useSectionLooks() {
  const context = useContext(SectionLooksContext)
  if (!context) {
    throw new Error('useSectionLooks must be used inside SectionLooksProvider')
  }
  return context
}
