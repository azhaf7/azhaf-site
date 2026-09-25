import { Link } from 'react-router-dom'
import { rememberBookOrigin } from '../utils/bookOrigin'
import { catalogBookSize } from '../utils/shelfLayout'
import { Flower } from './Flower'

export function CoverArt({ book }) {
  if (book.coverImage) {
    return (
      <span className="cover-art cover-art--photo">
        <img src={book.coverImage} alt="" draggable={false} decoding="sync" />
      </span>
    )
  }

  return (
    <span className="cover-art">
      <Flower kind={book.flower ?? 'sunflower'} className="cover-art__sunflower" />
      <span className="cover-art__title">{book.title}</span>
    </span>
  )
}

export default function Book({ book, size = 'shelf', interactive = true, open = false, dragProps }) {
  const isHero = size === 'hero'
  const catalog = size === 'shelf' ? catalogBookSize(book) : null
  const className = [
    'book',
    `book--${size}`,
    `book--${book.slug}`,
    book.coverImage ? 'book--illustrated' : '',
    open ? 'book--open' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const style = {
    '--book-w': `${isHero ? 164 : catalog ? catalog.width : book.width}px`,
    '--book-h': `${isHero ? 240 : catalog ? catalog.height : book.height}px`,
    '--book-d': `${isHero ? 26 : catalog ? catalog.depth : book.depth}px`,
    '--cover': book.cover.bg,
    '--cover-ink': book.cover.ink,
    '--cover-accent': book.cover.accent,
    '--spine': book.cover.spine,
    '--tilt': book.tilt,
  }

  const inner = (
    <>
      <span className="book__shadow" />
      <span className="book__3d">
        <span className="book__cover">
          <CoverArt book={book} />
        </span>
        <span className="book__back" />
        <span className="book__spine">
          <span className="book__spine-title">{book.spineTitle}</span>
        </span>
        <span className="book__pages" />
        <span className="book__top" />
        <span className="book__bottom" />
      </span>
    </>
  )

  if (!interactive) {
    return (
      <div className={className} style={style} aria-hidden="true">
        {inner}
      </div>
    )
  }

  return (
    <Link
      to={`/${book.slug}`}
      className={className}
      style={style}
      data-book={book.slug}
      aria-label={`${book.title}. ${book.subtitle}. Open book`}
      aria-describedby={dragProps ? 'shelf-drag-hint' : undefined}
      {...dragProps}
      onClick={(event) => rememberBookOrigin(book.slug, event.currentTarget)}
    >
      {inner}
      <span className="book__label" aria-hidden="true">
        <span className="book__label-title">{book.title}</span>
        <span className="book__label-sub">{book.subtitle}</span>
      </span>
    </Link>
  )
}
