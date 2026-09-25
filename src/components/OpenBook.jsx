import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CoverArt } from './Book'
import { catalogBookSize } from '../utils/shelfLayout'
import { books as allBooks } from '../data/books'
import { DEFAULT_BUDGET, MIN_BUDGET, getSpreadCount, paginateBook } from '../utils/paginate'

// A book's weight, 0 (the thinnest on the shelf) to 1 (the thickest). The
// cover's motion follows it: a thin book's light board lifts quickly and
// lands with a springy bounce; a thick book's heavy board is slow to lift,
// falls harder, and lands with a short thud that settles the whole book.
const DEPTHS = allBooks.map((entry) => catalogBookSize(entry).depth)
const MIN_DEPTH = Math.min(...DEPTHS)
const MAX_DEPTH = Math.max(...DEPTHS)

function bookWeight(book) {
  if (MAX_DEPTH === MIN_DEPTH) return 0.5
  const depth = catalogBookSize(book).depth
  return Math.min(1, Math.max(0, (depth - MIN_DEPTH) / (MAX_DEPTH - MIN_DEPTH)))
}

function coverMotion(weight) {
  return {
    swingMs: 900 + 650 * weight,
    // Heavier boards resist the hinge longer before they get going...
    stiffness: 1 + 0.35 * weight,
    // ...and are pulled down harder once past the upright.
    gravity: 0.2 + 0.25 * weight,
    reboundMs: 220 + 140 * weight,
    reboundOpen: 6 - 4 * weight,
    reboundClose: 3.5 - 2 * weight,
    impact: 0.3 + 0.7 * weight,
  }
}
const FLIP_MS = 720
const COVER_ANGLE_OPEN = -180
const DRAG_CLICK_PX = 10
const DRAG_COMMIT = 0.28
const CURL_SEGS = 12
// Phones get far fewer strips per turning sheet: a gentler bend, but much
// less drawing and 3D nesting, which mobile Safari struggles with (flicker,
// stalls, strips dropping out).
const CURL_SEGS_TOUCH = 3
const curlSegments = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    ? CURL_SEGS_TOUCH
    : CURL_SEGS
const LEAD_DEG = 30
const SHADE_MAX = 0.42
// The page size DEFAULT_BUDGET was tuned on, and the page unit at that size
// (must mirror --u in the stylesheet).
const REF_PAGE_W = 392
const REF_PAGE_H = 620
const pageUnit = (pageH) => Math.min(18, Math.max(13, pageH * 0.0258))
// Reading copy is set this much larger (relative to the page unit) than the
// size DEFAULT_BUDGET was tuned on.
const TEXT_SCALE = 1.22

// How much copy fits on a page of this size: area, divided by the area a
// character takes at the current page unit.
function budgetFor(pageW, pageH) {
  if (!pageW || !pageH) return DEFAULT_BUDGET
  const area = (pageW * pageH) / (REF_PAGE_W * REF_PAGE_H)
  const glyph = ((pageUnit(pageH) * TEXT_SCALE) / 16) ** 2
  return Math.max(MIN_BUDGET, Math.round((DEFAULT_BUDGET * area) / glyph))
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A sheet swinging under gravity: sinusoidal in/out, no abrupt start or stop.
function paperEase(t) {
  return 0.5 - 0.5 * Math.cos(Math.PI * t)
}

// Hardcover board: it starts slowly against the stiffness of the hinge,
// swings through the upright, then falls the rest of the way under its own
// weight, so it is still moving when it lands (and rebounds, see below).
function coverEase(t, motion) {
  const held = t ** motion.stiffness
  const inOut = 0.5 - 0.5 * Math.cos(Math.PI * held)
  return (1 - motion.gravity) * inOut + motion.gravity * held * held
}

// Absolute angle (0..180) of every strip along the sheet, spine → free edge.
// The free edge leads in the direction of travel, most strongly mid-turn, so
// the sheet bows like paper instead of swinging as one rigid panel.
function sheetAngles(progress, dir, segs = CURL_SEGS) {
  const base = 180 * progress
  const wave = Math.sin(Math.PI * progress)
  const lead = dir === 'prev' ? -1 : 1
  const angles = []
  for (let i = 0; i < segs; i += 1) {
    const edge = (i + 1) / segs
    const bow = LEAD_DEG * wave * edge ** 1.6
    angles.push(Math.min(180, Math.max(0, base + lead * bow)))
  }
  return angles
}

const toRad = (deg) => (deg * Math.PI) / 180

// Lambert-style darkening as a face turns away from the reader.
function frontShade(angle) {
  return SHADE_MAX * (1 - Math.cos(toRad(Math.min(90, angle))))
}

function backShade(angle) {
  return SHADE_MAX * (1 - Math.cos(toRad(180 - Math.max(90, angle))))
}

function pageAt(pages, index) {
  if (index < 0 || index >= pages.length) return { kind: 'blank', id: `blank-${index}` }
  return pages[index]
}

function isExternal(href) {
  return href.startsWith('http')
}

function linkLabel(link) {
  if (link.href.startsWith('mailto:')) return `${link.label} →`
  if (link.label === 'Live site') return 'View project ↗'
  return `${link.label} ↗`
}

function Folio({ number, side }) {
  return (
    <span className={`leaf-page__folio leaf-page__folio--${side}`}>
      <span className="leaf-page__num">{number > 0 ? String(number).padStart(2, '0') : ''}</span>
    </span>
  )
}

function PageScene({ book, scene = false }) {
  const src = book.pageImage || book.endpaper
  if (scene && src) {
    return (
      <>
        <span className="leaf-page__scene" aria-hidden="true">
          <img src={src} alt="" draggable={false} />
        </span>
        <span className="leaf-page__wash" aria-hidden="true" />
        <span className="leaf-page__grain" aria-hidden="true" />
      </>
    )
  }
  return (
    <>
      <span className="leaf-page__field" aria-hidden="true" />
      <span className="leaf-page__grain" aria-hidden="true" />
    </>
  )
}

function PageViewBase({ page, book, number, side }) {
  const isProject = book.category === 'Project'

  if (page.kind === 'blank') {
    return (
      <div className={`leaf-page leaf-page--blank leaf-page--${side}`}>
        <PageScene book={book} />
        <Folio number={number} side={side} />
      </div>
    )
  }

  if (page.kind === 'title') {
    return (
      <div className={`leaf-page leaf-page--title leaf-page--${side}`}>
        <PageScene book={book} scene />
        <div className="leaf-page__title-block">
          <p className="leaf-page__title">{book.title}</p>
          <p className="leaf-page__subtitle">{book.subtitle}</p>
        </div>
        <div className="leaf-page__colophon">
          <span className="leaf-page__rule" aria-hidden="true" />
          <p className="leaf-page__role">{book.role ?? 'Software Developer'}</p>
          {book.tags?.length ? (
            <p className="leaf-page__tags">{book.tags.join(' · ')}</p>
          ) : null}
          <p className="leaf-page__place">
            Copenhagen · {book.year}
          </p>
        </div>
        <Folio number={number} side={side} />
      </div>
    )
  }

  if (page.kind === 'photo') {
    return (
      <div className={`leaf-page leaf-page--photo leaf-page--${side}`}>
        <PageScene book={book} />
        <figure className="leaf-page__shot">
          <img src={page.src} alt={page.alt} draggable={false} />
        </figure>
        <Folio number={number} side={side} />
      </div>
    )
  }

  const running = side === 'left' ? book.title : book.role ?? book.subtitle
  // Drop cap only when a paragraph opens the page (no lead-in above it).
  const dropCapIndex = page.blocks[0]?.type === 'p' && !page.blocks[0].cont ? 0 : -1

  return (
    <div className={`leaf-page leaf-page--body leaf-page--${side}`}>
      <PageScene book={book} />
      <p className="leaf-page__running">{running}</p>
      {page.blocks.map((block, index) => {
        if (block.type === 'summary') {
          return (
            <div key={`s-${index}`} className="leaf-page__lead">
              {block.cont ? null : (
                <p className="leaf-page__lead-label">
                  {isProject ? 'In brief' : 'A little about me'}
                </p>
              )}
              <p className="leaf-page__summary">{block.text}</p>
            </div>
          )
        }
        if (block.type === 'p') {
          const dropCap = index === dropCapIndex
          return (
            <p key={`p-${index}`} className={`leaf-page__p${dropCap ? ' leaf-page__p--first' : ''}`}>
              {block.text}
            </p>
          )
        }
        if (block.type === 'list') {
          const isTech = isProject && block.heading === 'Stack'
          if (isTech) {
            return (
              <section key={`t-${index}`} className="leaf-page__tech">
                <h2>Technologies</h2>
                <p>
                  {block.items.map((item, i) => (
                    <span key={item}>
                      {i > 0 ? <span className="leaf-page__dot" aria-hidden="true"> · </span> : null}
                      {item}
                    </span>
                  ))}
                </p>
              </section>
            )
          }
          const prose = block.items.some((item) => item.length > 60)
          return (
            <section
              key={`l-${index}`}
              className={`leaf-page__list${prose ? ' leaf-page__list--prose' : ''}`}
            >
              <h2>{block.heading}</h2>
              <ul>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )
        }
        if (block.type === 'links') {
          return (
            <div key={`k-${index}`} className="leaf-page__links">
              {block.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {linkLabel(link)}
                </a>
              ))}
            </div>
          )
        }
        return null
      })}
      <Folio number={number} side={side} />
    </div>
  )
}

// A page's contents only change when the page itself does. Memoised so the
// dozens of copies drawn for a turning sheet aren't rebuilt every frame.
const PageView = memo(PageViewBase)

// Strips are chained: each one hangs off the outer edge of the one before it
// and only adds its own small bend, so the sheet stays continuous. Shading is
// interpolated across strip boundaries (Gouraud-style) so no seams show.
function CurlStrip({ index, segs, angles, sign, front, back, book, frontNum, backNum }) {
  const remain = segs - index
  const current = angles[index]
  const parent = index === 0 ? 0 : angles[index - 1]
  const delta = sign * (current - parent)
  const inner = index === 0 ? angles[0] : (angles[index - 1] + angles[index]) / 2
  const outer = index === segs - 1 ? angles[index] : (angles[index] + angles[index + 1]) / 2

  return (
    <div
      className={`open-book__curl${index === 0 ? ' open-book__curl--root' : ''}`}
      style={{
        '--i': index,
        '--remain': remain,
        '--f0': frontShade(inner).toFixed(3),
        '--f1': frontShade(outer).toFixed(3),
        '--b0': backShade(inner).toFixed(3),
        '--b1': backShade(outer).toFixed(3),
        transform: `rotateY(${delta.toFixed(3)}deg)`,
      }}
    >
      {/* Only the face turned towards the reader is shown. Set explicitly
          rather than trusting backface-visibility, which iOS Safari gets
          wrong here (the previous page's text showed through mid-turn). */}
      <div
        className="open-book__curl-face open-book__curl-face--front"
        style={{ visibility: current < 90 ? 'visible' : 'hidden' }}
      >
        <div className="open-book__curl-page">
          <PageView page={front} book={book} number={frontNum} side="right" />
        </div>
      </div>
      <div
        className="open-book__curl-face open-book__curl-face--back"
        style={{ visibility: current < 90 ? 'hidden' : 'visible' }}
      >
        <div className="open-book__curl-page">
          <PageView page={back} book={book} number={backNum} side="left" />
        </div>
      </div>
      {index < segs - 1 ? (
        <CurlStrip
          index={index + 1}
          segs={segs}
          angles={angles}
          sign={sign}
          front={front}
          back={back}
          book={book}
          frontNum={frontNum}
          backNum={backNum}
        />
      ) : null}
    </div>
  )
}

function CurlLeaf({ angle, dir, segs, front, back, book, frontNum, backNum }) {
  const progress = Math.min(1, Math.abs(angle) / 180)
  const sign = angle > 0 ? 1 : -1
  const angles = sheetAngles(progress, dir, segs)

  return (
    <div
      className="open-book__leaf"
      style={{
        '--flip-progress': progress,
        '--segs': segs,
      }}
    >
      <CurlStrip
        index={0}
        segs={segs}
        angles={angles}
        sign={sign}
        front={front}
        back={back}
        book={book}
        frontNum={frontNum}
        backNum={backNum}
      />
    </div>
  )
}

export default function OpenBook({
  book,
  active = true,
  closing = false,
  traveling = false,
  onOpened,
  onClosed,
}) {
  const [budget, setBudget] = useState(DEFAULT_BUDGET)
  const segs = useMemo(curlSegments, [])
  const dragFrame = useRef(0)
  const dragNext = useRef(null)
  const pages = useMemo(() => paginateBook(book, budget), [book, budget])
  const spreadCount = getSpreadCount(pages)
  const [coverAngle, setCoverAngle] = useState(0)
  // How far open the book is, ignoring the landing rebound: drives the slide
  // of the whole book, which must not wobble when the board bounces.
  const [coverProgress, setCoverProgress] = useState(0)
  // The little drop of the whole book when a board lands (0 at rest).
  const [impact, setImpact] = useState(0)
  const weight = bookWeight(book)
  const motion = useMemo(() => coverMotion(weight), [weight])
  const [spread, setSpread] = useState(0)
  const [flip, setFlip] = useState(null)
  const [shut, setShut] = useState(false)
  const busyRef = useRef(false)
  const animRef = useRef(0)
  const coverAnimRef = useRef(0)
  const coverAngleRef = useRef(0)
  const spreadRef = useRef(0)
  const dragRef = useRef(null)
  const stageRef = useRef(null)
  const measureRef = useRef(null)

  useEffect(() => {
    spreadRef.current = spread
  }, [spread])

  // Re-flow the copy whenever the page block changes size.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const measure = () => {
      setBudget(budgetFor((stage.offsetWidth - 28) / 2, stage.offsetHeight - 22))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  // The budget is only an estimate. Every page is also laid out in a hidden
  // copy of the page box; if any of them overflows, re-flow with less copy
  // per page until they all fit.
  useLayoutEffect(() => {
    const root = measureRef.current
    if (!root || budget <= MIN_BUDGET) return
    const overflowing = [...root.querySelectorAll('.leaf-page')].some(
      (page) => page.scrollHeight > page.clientHeight + 1,
    )
    if (overflowing) setBudget((current) => Math.max(MIN_BUDGET, Math.round(current * 0.9)))
  }, [pages, budget])

  // Never point past the last spread after a re-flow.
  useEffect(() => {
    if (spread > spreadCount - 1) {
      spreadRef.current = spreadCount - 1
      setSpread(spreadCount - 1)
    }
  }, [spread, spreadCount])

  const canPrev = spread > 0
  const canNext = spread < spreadCount - 1
  // The board lies flat only at exactly 180deg; until then it is airborne and
  // must render in front of everything, carrying the title page on its inside.
  // Open once the swing has finished (progress 1), not only at exactly
  // 180deg: the landing bounce briefly lifts the board a few degrees, and
  // switching the open layout off and on for that made the book jump.
  const coverAtRest =
    Math.abs(coverAngle - COVER_ANGLE_OPEN) < 0.01 || (!closing && coverProgress >= 1)
  const coverReady = !closing && coverAtRest
  const openness = coverProgress
  // Light on the swinging board, and the shadow it throws on the page below.
  const coverTilt = Math.abs(coverAngle)
  const coverFrontShade = frontShade(coverTilt)
  const coverBackShade = backShade(coverTilt)
  const coverCast = coverTilt > 0.01 && coverTilt < 179.99 ? Math.sin(toRad(coverTilt)) : 0

  const writeCover = useCallback((angle, progress) => {
    coverAngleRef.current = angle
    setCoverAngle(angle)
    if (progress !== undefined) setCoverProgress(progress)
  }, [])

  const stopAnim = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }
  }, [])

  const stopCoverAnim = useCallback(() => {
    if (coverAnimRef.current) {
      cancelAnimationFrame(coverAnimRef.current)
      coverAnimRef.current = 0
    }
  }, [])

  const swingCover = useCallback(
    (from, to, ease, onDone) => {
      stopCoverAnim()
      const progressAt = (angle) => Math.min(1, Math.abs(angle) / 180)
      if (prefersReducedMotion()) {
        writeCover(to, progressAt(to))
        onDone?.()
        return
      }
      const span = Math.abs(to - from)
      // Rebound only after a real swing, towards where the board came from.
      const rebound = span < 20 ? 0 : to === 0 ? motion.reboundClose : motion.reboundOpen
      const back = Math.sign(from - to)
      const swingMs = motion.swingMs * Math.max(0.35, span / 180)
      const start = performance.now()
      const tick = () => {
        const elapsed = performance.now() - start
        if (elapsed < swingMs) {
          const angle = from + (to - from) * ease(elapsed / swingMs, motion)
          writeCover(angle, progressAt(angle))
          coverAnimRef.current = requestAnimationFrame(tick)
          return
        }
        const u = (elapsed - swingMs) / motion.reboundMs
        if (rebound && u < 1) {
          const bounce = Math.sin(Math.PI * u) * (1 - 0.35 * u)
          writeCover(to + back * rebound * bounce, progressAt(to))
          setImpact(bounce * motion.impact)
          coverAnimRef.current = requestAnimationFrame(tick)
          return
        }
        coverAnimRef.current = 0
        setImpact(0)
        writeCover(to, progressAt(to))
        onDone?.()
      }
      coverAnimRef.current = requestAnimationFrame(tick)
    },
    [motion, stopCoverAnim, writeCover],
  )

  const animateAngle = useCallback(
    (from, to, onDone, duration = FLIP_MS) => {
      stopAnim()
      if (prefersReducedMotion()) {
        onDone(to)
        return
      }
      const start = performance.now()
      const tick = () => {
        const t = Math.min(1, Math.max(0, (performance.now() - start) / duration))
        const angle = from + (to - from) * paperEase(t)
        setFlip((current) => (current ? { ...current, angle, dragging: false } : current))
        if (t < 1) {
          animRef.current = requestAnimationFrame(tick)
        } else {
          animRef.current = 0
          onDone(to)
        }
      }
      animRef.current = requestAnimationFrame(tick)
    },
    [stopAnim],
  )

  const finishNext = useCallback(() => {
    setSpread((value) => value + 1)
    setFlip(null)
    busyRef.current = false
  }, [])

  const finishPrev = useCallback(() => {
    setSpread((value) => value - 1)
    setFlip(null)
    busyRef.current = false
  }, [])

  const turnNext = useCallback(
    (fromAngle = 0) => {
      if (!canNext || !coverReady || closing) return
      if (busyRef.current && fromAngle === 0) return
      busyRef.current = true
      if (prefersReducedMotion()) {
        setSpread((value) => value + 1)
        setFlip(null)
        busyRef.current = false
        return
      }
      setFlip({ dir: 'next', angle: fromAngle, dragging: false })
      animateAngle(fromAngle, -180, finishNext)
    },
    [animateAngle, canNext, closing, coverReady, finishNext],
  )

  const turnPrev = useCallback(
    (fromAngle = -180) => {
      if (!canPrev || !coverReady || closing) return
      if (busyRef.current && fromAngle === -180) return
      busyRef.current = true
      if (prefersReducedMotion()) {
        setSpread((value) => value - 1)
        setFlip(null)
        busyRef.current = false
        return
      }
      setFlip({ dir: 'prev', angle: fromAngle, dragging: false })
      animateAngle(fromAngle, 0, finishPrev)
    },
    [animateAngle, canPrev, closing, coverReady, finishPrev],
  )

  const snapBack = useCallback(
    (dir, fromAngle) => {
      const to = dir === 'next' ? 0 : -180
      animateAngle(fromAngle, to, () => {
        setFlip(null)
        busyRef.current = false
      })
    },
    [animateAngle],
  )

  useEffect(() => {
    if (!active || closing) return undefined
    let cancelled = false
    const startId = window.setTimeout(() => {
      swingCover(coverAngleRef.current, COVER_ANGLE_OPEN, coverEase, () => {
        if (!cancelled) onOpened?.()
      })
    }, prefersReducedMotion() ? 0 : 180)
    return () => {
      cancelled = true
      window.clearTimeout(startId)
      stopCoverAnim()
    }
  }, [active, closing, onOpened, stopCoverAnim, swingCover])

  useEffect(() => {
    if (!closing) {
      setShut(false)
      return undefined
    }
    // Like a real book: the pages already read fold over together with the
    // front board (the board carries the current left page on its inside),
    // instead of being turned back one at a time.
    let cancelled = false
    stopAnim()
    dragRef.current = null
    busyRef.current = true
    setFlip(null)
    swingCover(coverAngleRef.current, 0, coverEase, () => {
      if (!cancelled) setShut(true)
    })
    return () => {
      cancelled = true
      stopAnim()
      stopCoverAnim()
    }
  }, [closing, stopAnim, stopCoverAnim, swingCover])

  // Report the close only after the final 0deg has been committed to the DOM,
  // so whoever takes over can measure the closed cover exactly where it is.
  useEffect(() => {
    if (closing && shut) onClosed?.()
  }, [closing, shut, onClosed])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        turnNext()
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        turnPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turnNext, turnPrev])

  useEffect(
    () => () => {
      stopAnim()
      stopCoverAnim()
    },
    [stopAnim, stopCoverAnim],
  )

  const onPointerDown = (event) => {
    if (event.target.closest('a, button')) return
    if (busyRef.current || !coverReady || closing) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const dir = event.clientX >= rect.left + rect.width / 2 ? 'next' : 'prev'
    if (dir === 'next' && !canNext) return
    if (dir === 'prev' && !canPrev) return
    dragRef.current = {
      dir,
      startX: event.clientX,
      pointerId: event.pointerId,
      dragging: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || prefersReducedMotion()) return
    const dx = event.clientX - drag.startX
    if (!drag.dragging && Math.abs(dx) < DRAG_CLICK_PX) return
    drag.dragging = true
    busyRef.current = true
    const width = stageRef.current?.offsetWidth ? stageRef.current.offsetWidth / 2 : 280
    const progress =
      drag.dir === 'next'
        ? Math.min(1, Math.max(0, -dx / width))
        : Math.min(1, Math.max(0, dx / width))
    dragNext.current =
      drag.dir === 'next'
        ? { dir: 'next', angle: progress * -180, dragging: true }
        : { dir: 'prev', angle: -180 + progress * 180, dragging: true }
    // Touch screens fire moves faster than the screen refreshes: draw the
    // sheet at most once per frame, with the latest finger position.
    if (!dragFrame.current) {
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = 0
        if (dragNext.current) setFlip(dragNext.current)
      })
    }
  }

  const onPointerUp = (event) => {
    const drag = dragRef.current
    dragRef.current = null
    if (dragFrame.current) {
      cancelAnimationFrame(dragFrame.current)
      dragFrame.current = 0
    }
    dragNext.current = null
    if (!drag) return
    if (!drag.dragging) {
      if (drag.dir === 'next') turnNext(0)
      else turnPrev(-180)
      return
    }
    const dx = event.clientX - drag.startX
    const width = stageRef.current?.offsetWidth ? stageRef.current.offsetWidth / 2 : 280
    const progress =
      drag.dir === 'next'
        ? Math.min(1, Math.max(0, -dx / width))
        : Math.min(1, Math.max(0, dx / width))
    const angle = drag.dir === 'next' ? progress * -180 : -180 + progress * 180
    if (progress >= DRAG_COMMIT) {
      if (drag.dir === 'next') turnNext(angle)
      else turnPrev(angle)
    } else {
      snapBack(drag.dir, angle)
    }
  }

  const leftIndex = spread * 2
  const rightIndex = spread * 2 + 1
  const flipping = Boolean(flip)
  const angle = flip?.angle ?? (flip?.dir === 'prev' ? -180 : 0)
  const progress = Math.abs(angle) / 180

  let staticLeft = pageAt(pages, leftIndex)
  let staticRight = pageAt(pages, rightIndex)
  let underLeft = null
  let underRight = null
  let leafFront = null
  let leafBack = null
  let leafFrontNum = 0
  let leafBackNum = 0

  if (flip?.dir === 'next') {
    staticLeft = pageAt(pages, leftIndex)
    underRight = pageAt(pages, rightIndex + 2)
    leafFront = pageAt(pages, rightIndex)
    leafBack = pageAt(pages, rightIndex + 1)
    leafFrontNum = rightIndex + 1
    leafBackNum = rightIndex + 2
    staticRight = null
  } else if (flip?.dir === 'prev') {
    underLeft = pageAt(pages, leftIndex - 2)
    staticRight = pageAt(pages, rightIndex)
    leafFront = pageAt(pages, leftIndex - 1)
    leafBack = pageAt(pages, leftIndex)
    leafFrontNum = leftIndex
    leafBackNum = leftIndex + 1
    staticLeft = null
  }

  // Read sheets pile up on the left; unread sheets thin out on the right.
  const denom = Math.max(1, spreadCount - 1)
  const stackLeft = spread / denom
  const stackRight = 1 - stackLeft

  const size = catalogBookSize(book)
  const bookClass = [
    'open-book',
    coverAtRest ? 'open-book--open' : 'open-book--closed',
    flipping ? 'open-book--flipping' : '',
    flip?.dir === 'next' ? 'open-book--flip-next' : '',
    flip?.dir === 'prev' ? 'open-book--flip-prev' : '',
    closing ? 'open-book--closing' : '',
    traveling ? 'open-book--traveling' : '',
    book.coverImage ? 'open-book--illustrated' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={bookClass}
      style={{
        '--cover': book.cover.bg,
        '--cover-ink': book.cover.ink,
        '--cover-accent': book.cover.accent,
        '--spine': book.cover.spine,
        // Shelf geometry: the closed book keeps the shelf copy's proportions
        // so the two can be swapped without a seam.
        '--book-w': `${size.width}px`,
        '--book-h': `${size.height}px`,
        '--book-d': `${size.depth}px`,
        '--aspect': size.width / size.height,
        '--flip': `${angle}deg`,
        '--flip-progress': progress,
        '--cover-angle': `${coverAngle}deg`,
        '--openness': openness,
        '--weight': weight.toFixed(3),
        '--impact': impact.toFixed(3),
        '--cover-front-shade': coverFrontShade.toFixed(3),
        '--cover-back-shade': coverBackShade.toFixed(3),
        '--cover-cast': coverCast.toFixed(3),
        '--stack-left': stackLeft,
        '--stack-right': stackRight,
      }}
    >
      <div className="open-book__frame">
        <div className="open-book__ground" aria-hidden="true" />
        <div className="open-book__scene">
          <div className="open-book__stage" ref={stageRef}>
            <div className="open-book__case open-book__case--right" aria-hidden="true" />
            <div className="open-book__case open-book__case--left" aria-hidden="true" />
            <div className="open-book__block">
              <div className="open-book__spine-well" aria-hidden="true" />
              <div className="open-book__edge open-book__edge--left" aria-hidden="true" />
              <div className="open-book__edge open-book__edge--right" aria-hidden="true" />
              <div className="open-book__foot open-book__foot--left" aria-hidden="true" />
              <div className="open-book__foot open-book__foot--right" aria-hidden="true" />

              <div
                className="open-book__spread"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {underLeft ? (
                  <div className="open-book__page open-book__page--left open-book__page--under">
                    <PageView page={underLeft} book={book} number={leftIndex - 1} side="left" />
                  </div>
                ) : null}

                {staticLeft ? (
                  <div className="open-book__page open-book__page--left">
                    <PageView page={staticLeft} book={book} number={leftIndex + 1} side="left" />
                  </div>
                ) : null}

                {underRight ? (
                  <div className="open-book__page open-book__page--right open-book__page--under">
                    <PageView page={underRight} book={book} number={rightIndex + 3} side="right" />
                  </div>
                ) : null}

                {staticRight ? (
                  <div className="open-book__page open-book__page--right">
                    <PageView page={staticRight} book={book} number={rightIndex + 1} side="right" />
                    {canNext ? <span className="open-book__dogear" aria-hidden="true" /> : null}
                  </div>
                ) : null}

                {flipping && leafFront ? (
                  <CurlLeaf
                    segs={segs}
                    angle={angle}
                    dir={flip.dir}
                    front={leafFront}
                    back={leafBack}
                    book={book}
                    frontNum={leafFrontNum}
                    backNum={leafBackNum}
                  />
                ) : null}

                <div className="open-book__measure" ref={measureRef} aria-hidden="true">
                  {pages.map((page, index) =>
                    page.kind === 'body' ? (
                      <div key={page.id} className="open-book__page open-book__page--right">
                        <PageView page={page} book={book} number={index + 1} side={index % 2 ? 'right' : 'left'} />
                      </div>
                    ) : null,
                  )}
                </div>

                <div className="open-book__gutter" aria-hidden="true" />
                <div className="open-book__ribbon" aria-hidden="true" />
              </div>
            </div>

            <div
              className="open-book__cover"
              aria-hidden="true"
              style={{ transform: `rotateY(${coverAngle}deg)` }}
            >
              <div className="open-book__cover-front">
                {/* The shelf cover, scaled up: identical pixels to the book
                    that just traveled in from the shelf. */}
                <div className="open-book__skin">
                  <span className="book__cover">
                    <CoverArt book={book} />
                  </span>
                </div>
              </div>
              {/* The board's own thickness: fore-edge, head and tail. */}
              <div className="open-book__cover-edge" />
              <div className="open-book__cover-edge open-book__cover-edge--head" />
              <div className="open-book__cover-edge open-book__cover-edge--tail" />
              <div className="open-book__cover-inside">
                {book.pageImage || book.endpaper ? (
                  <img src={book.pageImage || book.endpaper} alt="" draggable={false} />
                ) : null}
              </div>
              {/* The first left-hand page rides on the inside of the board; once
                  the board lies flat the static left page takes over seamlessly. */}
              <div className="open-book__cover-page">
                <PageView page={pageAt(pages, leftIndex)} book={book} number={leftIndex + 1} side="left" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="open-book__nav">
        <button
          type="button"
          className="open-book__nav-btn"
          onClick={() => turnPrev()}
          disabled={!canPrev || !coverReady || closing}
          aria-label="Previous pages"
        >
          ← Back
        </button>
        <span className="open-book__folio" aria-live="polite">
          {String(spread + 1).padStart(2, '0')}
          <span className="open-book__folio-sep" aria-hidden="true">
            /
          </span>
          {String(spreadCount).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="open-book__nav-btn"
          onClick={() => turnNext()}
          disabled={!canNext || !coverReady || closing}
          aria-label="Next pages"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
