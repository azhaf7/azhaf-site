import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getBookBySlug } from '../data/books'
import { bookIndex, shelfRestVars } from '../utils/shelfLayout'
import { useShelfLook } from '../hooks/useShelfLook'
import {
  clearBookOrigin,
  facingPose,
  focusShelfBook,
  measureShelfItem,
  peekBookOrigin,
  shelfPose,
} from '../utils/bookOrigin'
import Book from './Book'
import OpenBook from './OpenBook'

const TRAVEL_MS = 1000
const FADE_OUT_MS = 420

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// The catalog cover itself, lifted into a fixed layer so it can travel to
// the open-book position (and back) without the rest of the page moving.
function TravelingBook({ book, ghost, onArrive, ref }) {
  return (
    <div
      ref={ref}
      className={[
        'book-ghost',
        ghost.facing ? 'book-ghost--facing' : '',
        ghost.moving ? 'book-ghost--move' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        transform: ghost.pose,
        ...shelfRestVars(bookIndex(book.slug)),
      }}
      aria-hidden="true"
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
        onArrive?.()
      }}
    >
      <Book book={book} interactive={false} />
    </div>
  )
}

export default function BookOverlay() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const rawBook = getBookBySlug(slug)
  const { dress } = useShelfLook()
  const book = useMemo(
    () => (rawBook ? dress(rawBook) : undefined),
    [rawBook, dress],
  )
  const travelRef = useRef(null)
  const dialogRef = useRef(null)
  const ghostRef = useRef(null)
  const arriveRef = useRef(null)
  const departRef = useRef(null)
  const [phase, setPhase] = useState(() => {
    if (!book) return 'opening'
    if (prefersReducedMotion() || !peekBookOrigin(book.slug)) return 'opening'
    return 'lift'
  })
  const [ghost, setGhost] = useState(null)

  const markReading = useCallback(() => {
    setPhase((current) => (current === 'opening' ? 'reading' : current))
  }, [])

  const measureCover = useCallback(() => {
    const root = travelRef.current
    if (!root) return null
    // The board itself, not the artwork inside it: the image is drawn larger
    // than the board and cropped, so measuring it would overshoot the cover.
    const cover =
      root.querySelector('.open-book__cover-front') ||
      root.querySelector('.open-book__cover')
    return cover ? cover.getBoundingClientRect() : null
  }, [])

  const finishClose = useCallback(() => {
    const returnTo = book?.slug
    const node = ghostRef.current
    let clone = null
    if (node) {
      clone = node.cloneNode(true)
      clone.classList.add('book-ghost--handoff')
      document.body.appendChild(clone)
    }
    arriveRef.current = null
    clearBookOrigin()
    navigate('/')
    const settle = () => {
      if (returnTo) {
        document.querySelector(`[data-shelf-item="${returnTo}"]`)?.classList.add('is-inview')
        focusShelfBook(returnTo)
      }
      const shelf = returnTo && document.querySelector(`[data-shelf-item="${returnTo}"] .book`)
      if (shelf || !clone) {
        clone?.remove()
        return
      }
      requestAnimationFrame(settle)
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(settle)
    })
    window.setTimeout(() => clone?.remove(), 900)
  }, [book, navigate])

  // Called once the cover has closed: swap to the traveling book lying
  // face-on over the cover, then send it back into its slot.
  const beginReturn = useCallback(() => {
    const item = book && measureShelfItem(book.slug)
    const facing = item && facingPose(item, book, measureCover())
    if (!item || !facing || prefersReducedMotion()) {
      // No shelf to fly back to (list view, or a deep link): the closed book
      // and the backdrop fade away together instead of vanishing.
      if (prefersReducedMotion()) {
        finishClose()
        return
      }
      setPhase('fading')
      window.setTimeout(finishClose, FADE_OUT_MS)
      return
    }
    setPhase('returning')
    setGhost({ pose: facing, facing: true, moving: false })
    departRef.current = { pose: shelfPose(item), facing: false, moving: true }
    arriveRef.current = finishClose
  }, [book, finishClose, measureCover])

  // The traveling book is placed at rest first; once that pose has been
  // committed to the DOM (forced style flush — no frame timing involved) the
  // destination pose is applied so the transition starts from the right spot.
  useLayoutEffect(() => {
    if (!ghost || ghost.moving || !departRef.current) return undefined
    const node = ghostRef.current
    if (node) {
      void getComputedStyle(node).transform
      node.querySelector('.book__3d')?.getBoundingClientRect()
    }
    const next = departRef.current
    departRef.current = null
    setGhost(next)
    return undefined
  }, [ghost])

  // Safety net in case transitionend never fires (e.g. tab hidden mid-trip).
  useEffect(() => {
    if (!ghost?.moving) return undefined
    const doneId = window.setTimeout(() => arriveRef.current?.(), TRAVEL_MS + 120)
    return () => window.clearTimeout(doneId)
  }, [ghost])

  const close = useCallback(() => {
    if (phase === 'shutting' || phase === 'returning' || phase === 'lift' || phase === 'fading') return
    setPhase('shutting')
  }, [phase])

  useLayoutEffect(() => {
    if (!book) return undefined

    const previousOverflow = document.body.style.overflow
    const previousTitle = document.title
    document.body.style.overflow = 'hidden'
    document.title = `${book.title} — Azhaf Khan`

    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.title = previousTitle
      window.removeEventListener('keydown', onKey)
    }
  }, [book, close])

  useEffect(() => {
    if (phase !== 'reading') return
    const dialog = dialogRef.current
    if (!dialog) return
    const active = document.activeElement
    if (active && dialog.contains(active)) return
    dialog.focus({ preventScroll: true })
  }, [phase])

  // Lift: the traveling book appears exactly over its shelf slot, then rises,
  // turns face-on and grows until it covers the (still hidden) open view.
  useLayoutEffect(() => {
    if (!book || phase !== 'lift') return undefined
    const item = measureShelfItem(book.slug)
    const facing = item && facingPose(item, book, measureCover())
    if (!item || !facing || prefersReducedMotion()) {
      setPhase('opening')
      return undefined
    }

    setGhost({ pose: shelfPose(item), facing: false, moving: false })
    departRef.current = { pose: facing, facing: true, moving: true }
    // The traveling copy lands exactly on the closed cover, so both swap in
    // the same commit: no fade, no frame where neither is visible.
    arriveRef.current = () => {
      arriveRef.current = null
      setGhost(null)
      setPhase('opening')
    }
    return undefined
  }, [book, phase, measureCover])

  if (!book) {
    return <Navigate to="/" replace />
  }

  const veilOn = phase !== 'returning'
  const traveling = phase === 'lift' || phase === 'returning'

  return (
    <div
      className={[
        'overlay',
        traveling ? 'overlay--traveling' : '',
        phase === 'returning' ? 'overlay--returning' : '',
        phase === 'shutting' ? 'overlay--shutting' : '',
        phase === 'fading' ? 'overlay--fading' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div
        className={`overlay__backdrop${veilOn ? ' overlay__backdrop--in' : ''}`}
        style={{ opacity: veilOn ? 1 : 0 }}
        onClick={close}
        aria-hidden="true"
      />
      <div className="overlay__panel">
        <button
          type="button"
          className="overlay__close"
          aria-label="Close book"
          onClick={close}
          hidden={traveling}
        >
          <span className="overlay__close-x" aria-hidden="true">
            ×
          </span>
          <span className="overlay__close-text">Close book</span>
        </button>
        <h1 id="overlay-title" className="visually-hidden">
          {book.title}
        </h1>
        <div
          ref={travelRef}
          className="overlay__travel"
          style={{ visibility: traveling ? 'hidden' : undefined }}
        >
          <OpenBook
            book={book}
            active={phase === 'opening' || phase === 'reading'}
            closing={phase === 'shutting'}
            traveling={traveling}
            onOpened={markReading}
            onClosed={beginReturn}
          />
        </div>
      </div>
      {ghost ? (
        <TravelingBook
          ref={ghostRef}
          book={book}
          ghost={ghost}
          onArrive={() => {
            const arrive = arriveRef.current
            if (ghost.moving && arrive) arrive()
          }}
        />
      ) : null}
    </div>
  )
}
