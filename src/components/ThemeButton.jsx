import { useEffect, useRef, useState } from 'react'

// Each theme's page colour and the colour of the name portal's paper, for
// the swatches. The real colour tokens live in press.css under
// :root[data-theme='…'].
const THEMES = [
  { id: 'olive', label: 'Cream & olive', page: '#efe8d6', paper: '#4a5a27' },
  { id: 'blush', label: 'Blush', page: '#f6dde2', paper: '#6b1f36' },
]

const STORAGE_KEY = 'azhaf-press-theme'
const FADE_MS = 600

function currentTheme() {
  const id = document.documentElement.dataset.theme
  return THEMES.some((theme) => theme.id === id) ? id : 'olive'
}

function Swatch({ theme }) {
  return (
    <span
      className="theme-swatch"
      style={{ '--swatch-page': theme.page, '--swatch-paper': theme.paper }}
      aria-hidden="true"
    />
  )
}

// A dropdown of colour themes. The theme lives on <html data-theme>
// (index.html applies the saved one before first paint, so no flash).
export default function ThemeButton() {
  const [theme, setTheme] = useState(currentTheme)
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const itemRefs = useRef([])
  const current = THEMES.find((entry) => entry.id === theme) ?? THEMES[0]

  const choose = (id) => {
    const root = document.documentElement
    if (id !== theme) {
      // Let colours fade for a moment instead of snapping.
      root.classList.add('theme-fading')
      window.setTimeout(() => root.classList.remove('theme-fading'), FADE_MS)
      root.setAttribute('data-theme', id)
      // Browser chrome (status / address bar) matches the opening screen.
      const paper = THEMES.find((entry) => entry.id === id)?.paper
      if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper)
      try {
        window.localStorage.setItem(STORAGE_KEY, id)
      } catch {
        /* the choice just won't be remembered */
      }
      setTheme(id)
    }
    setOpen(false)
    buttonRef.current?.focus()
  }

  // Close on a click outside or Escape; focus the chosen item on open.
  useEffect(() => {
    if (!open) return undefined
    const index = THEMES.findIndex((entry) => entry.id === theme)
    itemRefs.current[index]?.focus()
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, theme])

  const onMenuKey = (event) => {
    const items = itemRefs.current
    const index = items.indexOf(document.activeElement)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      items[(index + step + items.length) % items.length]?.focus()
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
    }
    if (event.key === 'Tab') setOpen(false)
  }

  return (
    <div className="theme-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="theme-menu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Colour theme: ${current.label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Swatch theme={current} />
        <span className="theme-menu__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <ul className="theme-menu__list" role="menu" aria-label="Colour theme" onKeyDown={onMenuKey}>
          {THEMES.map((entry, index) => (
            <li key={entry.id} role="none">
              <button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role="menuitemradio"
                aria-checked={entry.id === theme}
                className="theme-menu__item"
                onClick={() => choose(entry.id)}
              >
                <Swatch theme={entry} />
                <span className="theme-menu__label">{entry.label}</span>
                <span className="theme-menu__check" aria-hidden="true">
                  {entry.id === theme ? '✓' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
