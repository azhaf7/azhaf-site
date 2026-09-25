import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMatch } from 'react-router-dom'
import { books } from '../data/books'
import { folio, hobbies } from '../data/folio'
import { profile } from '../data/profile'
import Book from './Book'
import ProjectList from './ProjectList'
import Contact from './Contact'
import NamePortal from './NamePortal'
import SplitWords from './SplitWords'
import { bookIndex, catalogBookSize, shelfSlotVars } from '../utils/shelfLayout'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useShelfLook } from '../hooks/useShelfLook'
import { useShelfDrag } from '../hooks/useShelfDrag'

const about = folio[0]
const VIEW_KEY = 'azhaf-press-view'

function readView() {
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'shelf'
  } catch {
    return 'shelf'
  }
}

function ShelfBook({ book, openSlug, index, dragging, dragProps }) {
  const size = catalogBookSize(book)
  const vacant = book.slug === openSlug
  const hover = bookIndex(book.slug) % 6
  const itemRef = useRef(null)
  const [seen, setSeen] = useState(false)
  // The drop-in plays once; after that the book must not fall again when
  // the shelf is reordered (moving a node in the DOM restarts animations).
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    if (vacant) setSeen(true)
  }, [vacant])

  useLayoutEffect(() => {
    const node = itemRef.current
    if (!node || seen) return
    const box = node.getBoundingClientRect()
    if (box.top < window.innerHeight * 0.94 && box.bottom > 32) setSeen(true)
  }, [seen])

  useEffect(() => {
    const node = itemRef.current
    if (!node || seen) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setSeen(true)
        io.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [seen])

  return (
    <li
      ref={itemRef}
      className={[
        'catalog__item',
        `catalog__item--hover-${hover}`,
        vacant ? 'catalog__item--vacant' : '',
        seen ? 'is-inview' : '',
        landed ? 'is-landed' : '',
        dragging ? 'is-dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-shelf-item={book.slug}
      style={shelfSlotVars(book, index)}
      data-reveal
      onAnimationEnd={(event) => {
        if (event.animationName === 'book-drop') setLanded(true)
      }}
    >
      {vacant ? (
        <span
          className="shelf__slot"
          data-slot={book.slug}
          aria-hidden="true"
          style={{
            '--book-w': `${size.width}px`,
            '--book-h': `${size.height}px`,
            '--book-d': `${size.depth}px`,
          }}
        />
      ) : (
        <Book book={book} dragProps={dragProps} />
      )}
    </li>
  )
}

export default function Shelf() {
  const openBook = useMatch('/:slug')
  const openSlug = openBook?.params?.slug
  const openWindow = useMatch('/project/:slug')
  const { dress } = useShelfLook()

  const pageRef = useRef(null)
  useScrollReveal(pageRef)
  const listRef = useRef(null)
  const { order, dragSlug, bind, announce } = useShelfDrag(listRef)
  const shelfBooks = order.map((slug) => books.find((book) => book.slug === slug))
  const [view, setView] = useState(readView)
  const chooseView = (next) => {
    setView(next)
    try {
      window.localStorage.setItem(VIEW_KEY, next)
    } catch {
      /* the choice just won't be remembered */
    }
  }

  return (
    <main className="shelf-page" ref={pageRef} inert={openBook || openWindow ? true : undefined}>
      <NamePortal>
        <section className="masthead" aria-labelledby="masthead-title" data-reveal>
          <h1 id="masthead-title" className="masthead__title">
            <span className="masthead__line">Software</span>
            <span className="masthead__line">Developer</span>
          </h1>
          <p className="masthead__intro">{profile.intro}</p>
          <ul className="masthead__cta min-links">
            <li>
              <a href="#books">See projects ↓</a>
            </li>
            <li>
              <a href="#contact">Get in touch ↓</a>
            </li>
          </ul>
        </section>
      </NamePortal>

      <section className="min-section" id="about" aria-labelledby="about-title" data-reveal>
        <h2 id="about-title" className="min-section__label">
          About
        </h2>
        <div className="min-section__body">
          {about.copy.map((paragraph, index) =>
            index === 0 ? (
              <SplitWords key={paragraph} as="p" className="min-lead" text={paragraph} delay={120} />
            ) : (
              <p key={paragraph} className="min-text">
                {paragraph}
              </p>
            ),
          )}
          <dl className="min-facts">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>
                  {fact.value}
                  <span>{fact.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="min-skills">
            {about.lists.map((list) => (
              <div key={list.heading}>
                <h3>{list.heading}</h3>
                <p>{list.items.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shelf-room" id="books" aria-labelledby="books-title">
        <header className="shelf-heading" data-reveal>
          <h2 id="books-title" className="folio-block__title">
            Projects
          </h2>
          <div className="view-switch" role="group" aria-label="Show projects as">
            {[
              ['shelf', 'Shelf'],
              ['list', 'List'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="view-switch__option"
                aria-pressed={view === value}
                onClick={() => chooseView(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        {view === 'list' ? (
          <ProjectList books={shelfBooks.map(dress)} />
        ) : (
          <>
            <ol className={`catalog${dragSlug ? ' catalog--dragging' : ''}`} ref={listRef}>
              {shelfBooks.map((book, index) => (
                <ShelfBook
                  key={book.slug}
                  book={dress(book)}
                  openSlug={openSlug}
                  index={index}
                  dragging={dragSlug === book.slug}
                  dragProps={bind(book.slug)}
                />
              ))}
            </ol>
            <p className="shelf-hint" id="shelf-drag-hint">
              <span className="shelf-hint__pointer">Drag books to rearrange the shelf · click to open</span>
              <span className="shelf-hint__touch">Hold a book to pick it up · tap to open</span>
              <span className="visually-hidden">. With the keyboard, Alt and the arrow keys move a book.</span>
            </p>
          </>
        )}
        <p className="visually-hidden" aria-live="polite">
          {announce}
        </p>
      </section>

      <section className="min-section" id={hobbies.id} aria-labelledby="hobbies-title" data-reveal>
        <h2 id="hobbies-title" className="min-section__label">
          {hobbies.title}
        </h2>
        <div className="min-section__body">
          <SplitWords as="p" className="min-text" text={hobbies.copy} delay={120} />
          <ul className="min-inline">
            {hobbies.items.map((item) => (
              <li key={item.name}>{item.name}</li>
            ))}
          </ul>
        </div>
      </section>

      <Contact />
    </main>
  )
}
