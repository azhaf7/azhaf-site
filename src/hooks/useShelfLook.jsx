import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { COVER_LOOKS, dressBook, wrapLookIndex } from '../data/looks'

const STORAGE_KEY = 'azhaf-press-look'
const ShelfLookContext = createContext(null)

function readSavedLook() {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY))
    return Number.isInteger(saved) ? wrapLookIndex(saved) : 0
  } catch {
    return 0
  }
}

function persistLook(index) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index))
  } catch {
    /* ignore quota / private mode */
  }
}

export function ShelfLookProvider({ children }) {
  const [lookIndex, setLookIndex] = useState(readSavedLook)

  const cycleLook = useCallback(() => {
    setLookIndex((current) => {
      const next = wrapLookIndex(current + 1)
      persistLook(next)
      return next
    })
  }, [])

  const resetLook = useCallback(() => {
    persistLook(0)
    setLookIndex(0)
  }, [])

  const value = useMemo(() => {
    const look = COVER_LOOKS[lookIndex]
    return {
      lookIndex,
      look,
      cycleLook,
      resetLook,
      dress: (book) => dressBook(book, lookIndex),
    }
  }, [cycleLook, lookIndex, resetLook])

  return <ShelfLookContext.Provider value={value}>{children}</ShelfLookContext.Provider>
}

export function useShelfLook() {
  const context = useContext(ShelfLookContext)
  if (!context) {
    throw new Error('useShelfLook must be used inside ShelfLookProvider')
  }
  return context
}
