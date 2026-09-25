import { Link } from 'react-router-dom'

function isExternal(href) {
  return href.startsWith('http')
}

// The same projects as the shelf, laid out to be skimmed: what it is, who
// built it, with what, and where to see it. A project opens in its own
// window here (the shelf is where the books are).
export default function ProjectList({ books }) {
  return (
    <ol className="project-list">
      {books.map((book, index) => (
        <li
          key={book.slug}
          className="project-list__item"
          style={{
            '--cover': book.cover.bg,
            '--cover-ink': book.cover.ink,
            '--i': index,
          }}
        >
          <Link
            to={`/project/${book.slug}`}
            className="project-list__thumb"
            tabIndex={-1}
            aria-hidden="true"
          >
            {book.coverImage ? <img src={book.coverImage} alt="" loading="lazy" /> : null}
          </Link>
          <div className="project-list__body">
            <p className="project-list__meta">
              {[book.role, book.year].filter(Boolean).join(' · ')}
            </p>
            <h3 className="project-list__title">
              <Link to={`/project/${book.slug}`} data-project={book.slug}>
                {book.title}
              </Link>
            </h3>
            <p className="project-list__sub">{book.subtitle}</p>
            <p className="project-list__summary">{book.blurb ?? book.summary}</p>
            {book.tags?.length ? (
              <ul className="project-list__tags" aria-label="Technologies">
                {book.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <p className="project-list__links">
              <Link to={`/project/${book.slug}`}>View project →</Link>
              {book.links?.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...(isExternal(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.label} ↗
                </a>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
