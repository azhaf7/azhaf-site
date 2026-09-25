import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { books } from '../data/books'

const STORAGE_KEY = 'azhaf-press-order'
const DRAG_START_PX = 6
const TOUCH_HOLD_MS = 260
const TOUCH_SLOP_PX = 8
const SWITCH_SLACK_PX = 10
const SLIDE_MS = 380
const DROP_MS = 560
const SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
// Overshoots a little: the book lands, dips and settles.
const DROP_EASE = 'cubic-bezier(0.34, 1.5, 0.5, 1)'

const defaultOrder = () => books.map((book) => book.slug)

export function readShelfOrder() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    const known = new Set(defaultOrder())
    if (!Array.isArray(saved)) return defaultOrder()
    const kept = saved.filter((slug) => known.has(slug))
    const missing = defaultOrder().filter((slug) => !kept.includes(slug))
    return [...new Set(kept), ...missing]
  } catch {
    return defaultOrder()
  }
}

function saveShelfOrder(order) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    /* private mode / quota: the order just won't persist */
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function moveTo(order, slug, index) {
  const next = order.filter((entry) => entry !== slug)
  next.splice(index, 0, slug)
  return next
}

// Layout position (ignores transforms), plus the zoom the shelf is drawn at
// so pointer pixels and layout pixels can be compared.
function layoutBox(el) {
  const zoom = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
  return {
    cx: (el.offsetLeft + el.offsetWidth / 2) * zoom,
    bottom: (el.offsetTop + el.offsetHeight) * zoom,
    x: el.offsetLeft * zoom,
    y: el.offsetTop * zoom,
    zoom,
  }
}

// Pick a book up off the shelf and put it somewhere else. The dragged book
// follows the pointer directly (no React renders per move); the rest of the
// row slides aside with FLIP animations as the order changes underneath it.
export function useShelfDrag(listRef) {
  const [order, setOrderState] = useState(readShelfOrder)
  // The latest order, readable from pointer handlers between renders.
  const orderRef = useRef(order)
  const [dragSlug, setDragSlug] = useState(null)
  const [announce, setAnnounce] = useState('')
  const session = useRef(null)
  const before = useRef(null)
  const suppressClick = useRef(false)
  const refocus = useRef(null)
  const landing = useRef(null)

  const items = useCallback(
    () => [...(listRef.current?.querySelectorAll('[data-shelf-item]') ?? [])],
    [listRef],
  )

  // Snapshot where every book stands, then change the order.
  const reorder = useCallback(
    (next) => {
      const snapshot = new Map()
      for (const el of items()) snapshot.set(el.dataset.shelfItem, layoutBox(el))
      before.current = snapshot
      orderRef.current = next
      setOrderState(next)
    },
    [items],
  )

  const placeDragged = useCallback(() => {
    const s = session.current
    if (!s?.active) return
    const box = layoutBox(s.el)
    s.tx = s.px - s.startX - (box.x - s.startBox.x)
    s.ty = s.py - s.startY - (box.y - s.startBox.y)
    s.el.style.transform = `translate3d(${s.tx}px, ${s.ty}px, 0)`
  }, [])

  // After a reorder: every other book animates from where it stood to its
  // new place, and the dragged book is re-anchored under the pointer.
  useLayoutEffect(() => {
    const snapshot = before.current
    before.current = null
    if (!snapshot) return
    const reduce = prefersReducedMotion()
    for (const el of items()) {
      const slug = el.dataset.shelfItem
      if (slug === session.current?.slug && session.current.active) continue
      const from = snapshot.get(slug)
      if (!from || reduce) continue
      const to = layoutBox(el)
      const dx = from.x - to.x
      const dy = from.y - to.y
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
      el.animate(
        [{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: SLIDE_MS, easing: SLIDE_EASE },
      )
    }
    placeDragged()
    if (refocus.current) {
      const slug = refocus.current
      refocus.current = null
      listRef.current?.querySelector(`[data-book="${slug}"]`)?.focus({ preventScroll: true })
    }
  }, [order, items, listRef, placeDragged])

  // The book thumps down and its neighbours rock a little.
  useLayoutEffect(() => {
    const el = landing.current
    landing.current = null
    if (!el || dragSlug) return undefined
    const bumped = [
      [el, 'is-dropped'],
      [el.previousElementSibling, 'is-nudged'],
      [el.nextElementSibling, 'is-nudged'],
    ].filter(([node]) => node)
    for (const [node, name] of bumped) {
      node.classList.remove(name)
      void node.offsetWidth
      node.classList.add(name)
    }
    // Not cleared on re-run: the classes must always come off again, or a
    // later reorder (which moves nodes) would replay the bounce.
    window.setTimeout(() => {
      for (const [node, name] of bumped) node.classList.remove(name)
    }, 800)
    return undefined
  }, [dragSlug])

  const pickTarget = useCallback(() => {
    const s = session.current
    const own = layoutBox(s.el)
    const cx = own.cx + s.tx
    const bottom = own.bottom + s.ty
    const distance = (box) => Math.hypot(box.cx - cx, (box.bottom - bottom) * 1.4)
    let best = null
    let bestDistance = Infinity
    items().forEach((el, index) => {
      const d = distance(layoutBox(el))
      if (d < bestDistance) {
        bestDistance = d
        best = { el, index }
      }
    })
    if (!best || best.el === s.el) return
    // A little hysteresis so books of different widths don't flip back and
    // forth when the pointer sits on the boundary between two slots.
    if (bestDistance > distance(own) - SWITCH_SLACK_PX) return
    reorder(moveTo(orderRef.current, s.slug, best.index))
  }, [items, reorder])

  const begin = useCallback((s) => {
    s.active = true
    s.startBox = layoutBox(s.el)
    s.tx = 0
    s.ty = 0
    s.vx = 0
    s.tilt = 0
    s.el.style.transition = 'none'
    s.el.getAnimations().forEach((animation) => animation.cancel())
    suppressClick.current = true
    window.getSelection()?.removeAllRanges()
    setDragSlug(s.slug)
    navigator.vibrate?.(8)
  }, [])

  const end = useCallback(() => {
    const s = session.current
    session.current = null
    window.clearTimeout(s?.holdTimer)
    if (!s?.active) return
    const { el, tx, ty } = s
    el.style.transform = ''
    el.style.removeProperty('--drag-tilt')
    if (!prefersReducedMotion()) {
      const landing = el.animate(
        [{ transform: `translate3d(${tx}px, ${ty}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: DROP_MS, easing: DROP_EASE },
      )
      landing.finished.catch(() => {}).finally(() => {
        el.style.transition = ''
      })
    } else {
      el.style.transition = ''
    }
    // Applied once React has re-rendered the dropped book (which rewrites its
    // className), see the layout effect below.
    landing.current = el
    setDragSlug(null)
    const current = orderRef.current
    saveShelfOrder(current)
    const book = books.find((entry) => entry.slug === s.slug)
    setAnnounce(`${book?.title} placed at position ${current.indexOf(s.slug) + 1} of ${current.length}.`)
    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
  }, [])

  const onPointerMove = useCallback(
    (event) => {
      const s = session.current
      if (!s || event.pointerId !== s.pointerId) return
      const dx = event.clientX - s.startX
      const dy = event.clientY - s.startY
      if (!s.active) {
        if (s.touch) {
          if (Math.hypot(dx, dy) > TOUCH_SLOP_PX) {
            // Finger moved before the hold: that's a scroll, not a pick-up.
            window.clearTimeout(s.holdTimer)
            session.current = null
          }
          return
        }
        if (Math.hypot(dx, dy) < DRAG_START_PX) return
        begin(s)
      }
      const now = performance.now()
      const dt = Math.max(1, now - (s.lastT ?? now - 16))
      s.vx = s.vx * 0.8 + ((event.clientX - (s.px ?? event.clientX)) / dt) * 0.2
      s.lastT = now
      s.px = event.clientX
      s.py = event.clientY
      // Swing with the motion like something held from the top.
      const tilt = Math.max(-14, Math.min(14, s.vx * 9))
      s.el.style.setProperty('--drag-tilt', `${tilt.toFixed(2)}deg`)
      placeDragged()
      pickTarget()
    },
    [begin, pickTarget, placeDragged],
  )

  useEffect(() => {
    const up = (event) => {
      if (session.current && event.pointerId === session.current.pointerId) end()
    }
    // Once a book is held on a touch screen, the finger moves the book, not
    // the page.
    const blockScroll = (event) => {
      if (session.current?.active) event.preventDefault()
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('touchmove', blockScroll, { passive: false })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('touchmove', blockScroll)
    }
  }, [end, onPointerMove])

  const bind = useCallback(
    (slug) => ({
      draggable: false,
      onDragStart: (event) => event.preventDefault(),
      onContextMenu: (event) => {
        if (session.current) event.preventDefault()
      },
      onPointerDown: (event) => {
        if (event.button !== 0 || session.current) return
        const el = event.currentTarget.closest('[data-shelf-item]')
        if (!el) return
        const s = {
          slug,
          el,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          px: event.clientX,
          py: event.clientY,
          touch: event.pointerType === 'touch',
          active: false,
        }
        session.current = s
        if (s.touch) {
          s.holdTimer = window.setTimeout(() => {
            if (session.current === s) {
              begin(s)
              placeDragged()
            }
          }, TOUCH_HOLD_MS)
        }
      },
      onClickCapture: (event) => {
        if (!suppressClick.current) return
        event.preventDefault()
        event.stopPropagation()
        suppressClick.current = false
      },
      onKeyDown: (event) => {
        if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
        event.preventDefault()
        const current = orderRef.current
        const index = current.indexOf(slug)
        const target = Math.max(0, Math.min(current.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)))
        if (target === index) return
        const next = moveTo(current, slug, target)
        refocus.current = slug
        reorder(next)
        saveShelfOrder(next)
        const book = books.find((entry) => entry.slug === slug)
        setAnnounce(`${book?.title} moved to position ${target + 1} of ${next.length}.`)
      },
    }),
    [begin, placeDragged, reorder],
  )

  return { order, dragSlug, bind, announce }
}
