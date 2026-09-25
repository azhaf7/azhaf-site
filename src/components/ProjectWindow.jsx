import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getBookBySlug } from '../data/books'
import { readShelfOrder } from '../hooks/useShelfDrag'
import { useShelfLook } from '../hooks/useShelfLook'

const CLOSE_MS = 260

function isExternal(href) {
  return href.startsWith('http')
}

// A project opened from the list view: an ordinary window with everything
// about the project on one scrolling page (the shelf opens the book instead).
export default function ProjectWindow() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { dress } = useShelfLook()
  const raw = getBookBySlug(slug)
  const book = raw ? dress(raw) : null
  const windowRef = useRef(null)
  const bodyRef = useRef(null)
  const [closing, setClosing] = useState(false)

  const order = readShelfOrder()
  const index = order.indexOf(slug)
  const prev = index > 0 ? getBookBySlug(order[index - 1]) : null
  const next = index >= 0 && index < order.length - 1 ? getBookBySlug(order[index + 1]) : null

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(
      () => {
        navigate('/')
        // Put focus back on the project the reader came from.
        requestAnimationFrame(() => {
          document.querySelector(`.project-list [data-project="${slug}"]`)?.focus({ preventScroll: true })
        })
      },
      reduce ? 0 : CLOSE_MS,
    )
  }, [closing, navigate, slug])

  useLayoutEffect(() => {
    if (!book) return undefined
    const previousOverflow = document.body.style.overflow
    const previousTitle = document.title
    document.body.style.overflow = 'hidden'
    document.title = `${book.title} — Azhaf Khan`
    return () => {
      document.body.style.overflow = previousOverflow
      document.title = previousTitle
    }
  }, [book])

  // New project (prev / next): start at the top, keep focus in the window.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
    windowRef.current?.focus({ preventScroll: true })
  }, [slug])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') close()
      if (event.key === 'Tab') {
        // Keep keyboard focus inside the window while it is open.
        const root = windowRef.current
        if (!root) return
        const focusable = [...root.querySelectorAll('a[href], button:not([disabled])')]
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  if (!book) return <Navigate to="/" replace />

  const stack = book.lists?.find((list) => list.heading === 'Stack')
  const otherLists = book.lists?.filter((list) => list !== stack) ?? []

  return (
    <div className={`project-window${closing ? ' is-closing' : ''}`}>
      <div className="project-window__backdrop" onClick={close} aria-hidden="true" />
      <div
        ref={windowRef}
        className="project-window__frame"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-window-title"
        tabIndex={-1}
        style={{ '--cover': book.cover.bg, '--cover-ink': book.cover.ink }}
      >
        <header className="project-window__bar">
          <span className="project-window__lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <p className="project-window__path">projects / {book.slug}</p>
          <button type="button" className="project-window__close" onClick={close} aria-label="Close project">
            ×
          </button>
        </header>

        <div className="project-window__body" ref={bodyRef}>
          <div className="project-window__hero">
            {book.coverImage ? (
              <div className="project-window__cover">
                <img src={book.coverImage} alt="" />
              </div>
            ) : null}
            <div className="project-window__intro">
              <p className="project-window__meta">
                {[book.role, book.year].filter(Boolean).join(' · ')}
              </p>
              <h2 id="project-window-title" className="project-window__title">
                {book.title}
              </h2>
              <p className="project-window__sub">{book.subtitle}</p>
              {book.links?.length ? (
                <p className="project-window__links">
                  {book.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="project-window__button"
                      {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </p>
              ) : null}
            </div>
          </div>

          <div className="project-window__content">
            {book.photos?.length ? (
              <div className="project-window__shots">
                {book.photos.map((src, index) => (
                  <img key={src} src={src} alt={`${book.title} screenshot ${index + 1}`} />
                ))}
              </div>
            ) : null}
            {book.summary ? <p className="project-window__summary">{book.summary}</p> : null}
            {book.paragraphs?.map((text) => (
              <p key={text} className="project-window__p">
                {text}
              </p>
            ))}

            {stack ? (
              <section className="project-window__section">
                <h3>Built with</h3>
                <ul className="project-window__chips">
                  {stack.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {otherLists.map((list) => (
              <section key={list.heading} className="project-window__section">
                <h3>{list.heading}</h3>
                <ul className="project-window__bullets">
                  {list.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="project-window__foot">
            {prev ? (
              <Link to={`/project/${prev.slug}`} className="project-window__step">
                <span>← Previous</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/project/${next.slug}`} className="project-window__step project-window__step--next">
                <span>Next →</span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}

