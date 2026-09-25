// Splits a line into words that rise out of a mask one after another when
// the nearest [data-reveal] ancestor scrolls into view (.is-inview). The
// words stay real text, so the line reads and wraps normally.
export default function SplitWords({ text, as: Tag = 'span', className = '', delay = 0 }) {
  const words = text.split(' ')
  return (
    <Tag className={`split-words ${className}`.trim()} style={{ '--rt-delay': `${delay}ms` }}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="rt-word">
            <span className="rt-word__inner" style={{ '--i': index }}>
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
