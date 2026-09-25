import { useEffect, useState } from 'react'
import GlyphPortal from '@/components/ui/glyph-portal'

const WORD = 'AZHAF'
// The book covers' face. Loaded by index.html; the portal freezes whichever
// face is available when it mounts, so wait for it (briefly) first.
// Only the face we wait for, plus system fallbacks: the portal turns its
// motion off if any listed web font isn't loaded yet when it mounts.
const FACE = '"Bagel Fat One", "Arial Black", sans-serif'
const FALLBACK = '"Arial Black", Arial, sans-serif'
const FONT_WAIT_MS = 1600

let fontLoad

// The opening of the site: my name on paper; scrolling flies the camera
// through one of its letters into the night blue the rest of the site is set
// on, so the portal hands over to the page without a seam.
export default function NamePortal({ children }) {
  const [face, setFace] = useState(null)

  useEffect(() => {
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      setFace(value)
    }
    fontLoad ??= document.fonts.load(`400 100px "Bagel Fat One"`, WORD)
    const timeout = window.setTimeout(() => finish(FALLBACK), FONT_WAIT_MS)
    fontLoad.then(
      (faces) => finish(faces.length ? FACE : FALLBACK),
      () => finish(FALLBACK),
    )
    return () => {
      settled = true
      window.clearTimeout(timeout)
    }
  }, [])

  // "Step inside" jumps straight to the content and leaves focus in it. The
  // portal shows no letters while its content has focus, so scrolling back
  // up would find a blank screen. Instead, scroll there smoothly (the camera
  // flies through the letter on the way) and keep focus out of the content.
  useEffect(() => {
    if (!face) return undefined
    const onClick = (event) => {
      const link = event.target.closest?.('.name-portal [data-gp-enter]')
      if (!link) return
      event.preventDefault()
      const content = document.querySelector('.name-portal [data-gp-content]')
      if (!content) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const top = content.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
      link.blur()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [face])

  // Scrolling back towards the name: let go of focus inside the content so
  // the letters come back.
  const onProgress = (progress) => {
    if (progress >= 0.85) return
    const active = document.activeElement
    if (active instanceof HTMLElement && active.closest('.name-portal [data-gp-content]')) {
      active.blur()
    }
  }

  if (!face) {
    return <div className="name-portal name-portal--loading" role="status" aria-label="Loading" />
  }

  return (
    <GlyphPortal
      className="name-portal"
      word={WORD}
      fontFamily={face}
      fontWeight={400}
      scrollLength={1.5}
      interactive
      enterLabel="Step inside"
      onProgress={onProgress}
      style={{
        // Theme tokens: letters are the page colour, on a contrasting paper.
        '--gp-paper': 'var(--portal-paper)',
        '--gp-ink': 'var(--portal-ink)',
        '--gp-field': 'var(--night)',
        '--gp-foreground': 'var(--heading)',
        fontFamily: 'var(--sans)',
      }}
      background={<div className="name-portal__field" />}
      front={
        <>
          <p className="name-portal__eyebrow">Hi, I’m</p>
          <span className="name-portal__scroll">Pick a letter, then scroll ↓</span>
        </>
      }
    >
      {children}
    </GlyphPortal>
  )
}
