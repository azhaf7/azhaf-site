export const DEFAULT_BUDGET = 620
export const MIN_BUDGET = 70

function blockSize(block) {
  if (block.type === 'summary' || block.type === 'p') {
    return block.text.length + 24
  }
  if (block.type === 'list') {
    return (
      40 +
      block.heading.length +
      block.items.reduce((sum, item) => sum + item.length + 16, 0)
    )
  }
  // One short row of links: it should never claim a page of its own.
  if (block.type === 'links') {
    return 16 + block.links.length * 8
  }
  return 40
}

function collectBlocks(book) {
  const blocks = []
  if (book.links?.length) {
    blocks.push({ type: 'links', links: book.links })
  }
  if (book.summary) {
    blocks.push({ type: 'summary', text: book.summary })
  }
  for (const text of book.paragraphs ?? []) {
    blocks.push({ type: 'p', text })
  }
  for (const list of book.lists ?? []) {
    blocks.push({ type: 'list', heading: list.heading, items: [...list.items] })
  }
  return blocks
}

function splitList(block, budget) {
  if (block.type !== 'list' || blockSize(block) <= budget || block.items.length < 2) {
    return [block]
  }

  const pieces = []
  let items = []
  let heading = block.heading

  const pieceSize = (chunk) =>
    blockSize({ type: 'list', heading, items: chunk })

  for (const item of block.items) {
    const next = [...items, item]
    if (items.length && pieceSize(next) > budget) {
      pieces.push({ type: 'list', heading, items })
      items = [item]
    } else {
      items = next
    }
  }
  if (items.length) {
    pieces.push({ type: 'list', heading, items })
  }
  return pieces
}

// A paragraph (or the summary) longer than a whole page is broken between
// sentences, or failing that between words, so every piece fits. Pieces
// after the first are continuations: no drop cap, no repeated label.
function splitParagraph(block, budget) {
  if ((block.type !== 'p' && block.type !== 'summary') || blockSize(block) <= budget) {
    return [block]
  }
  const room = Math.max(40, budget - 24)
  const sentences = block.text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [block.text]
  const units = sentences.flatMap((sentence) => {
    if (sentence.length <= room) return [sentence]
    const words = sentence.split(/(?<=\s)/)
    const parts = []
    let part = ''
    for (const word of words) {
      if (part && part.length + word.length > room) {
        parts.push(part)
        part = ''
      }
      part += word
    }
    if (part) parts.push(part)
    return parts
  })
  const pieces = []
  let text = ''
  for (const unit of units) {
    if (text && text.length + unit.length > room) {
      pieces.push(text.trim())
      text = ''
    }
    text += unit
  }
  if (text.trim()) pieces.push(text.trim())
  return pieces.map((piece, index) => ({ type: block.type, text: piece, cont: index > 0 }))
}

export function paginateBook(book, budget = DEFAULT_BUDGET) {
  const pages = [{ kind: 'title', id: `${book.slug}-title` }]
  const queue = collectBlocks(book)
    .flatMap((block) => splitList(block, budget))
    .flatMap((block) => splitParagraph(block, budget))

  let current = []
  let used = 0

  const flush = () => {
    if (!current.length) return
    pages.push({
      kind: 'body',
      id: `${book.slug}-body-${pages.length}`,
      blocks: current,
    })
    current = []
    used = 0
  }

  for (const block of queue) {
    const size = blockSize(block)
    if (used && used + size > budget) {
      flush()
    }
    current.push(block)
    used += size
  }
  flush()

  for (const [index, src] of (book.photos ?? []).entries()) {
    pages.push({
      kind: 'photo',
      id: `${book.slug}-photo-${index}`,
      src,
      alt: `${book.title} screenshot ${index + 1}`,
    })
  }

  return pages
}

export function getSpreadCount(pages) {
  return Math.max(1, Math.ceil(pages.length / 2))
}
