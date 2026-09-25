import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Flower } from './Flower'
import { useShelfLook } from '../hooks/useShelfLook'
import { useSectionLooks } from '../hooks/useSectionLooks.jsx'
import ThemeButton from './ThemeButton'

const NAV = [
  { hash: '#about', label: 'About' },
  { hash: '#books', label: 'Projects' },
  { hash: '#hobbies', label: 'Hobbies' },
  { hash: '#contact', label: 'Contact' },
]

const smoothstep = (a, b, n) => {
  const t = Math.min(1, Math.max(0, (n - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// The header over the name portal. `ink` is how dark its links should be
// (1 = blue on the paper, 0 = white on blue), following the camera's zoom
// (which runs over progress 0–0.78, see GlyphPortal). `solid` is its own
// blue background: 0 (see-through) for the whole zoom, and only 1 once the
// view behind it is already entirely blue, so the switch can't be seen.
function headerState() {
  const portal = document.querySelector('.name-portal')
  if (!portal) return { ink: 0, solid: 1 }
  const pin = portal.querySelector('[data-gp-pin]')
  if (portal.dataset.gpMotion === 'on' && pin) {
    const length = Number(portal.style.getPropertyValue('--gp-length')) || 1.5
    const progress = -portal.getBoundingClientRect().top / (pin.offsetHeight * length)
    return {
      ink: 1 - smoothstep(0.52, 0.72, progress),
      solid: smoothstep(0.74, 0.8, progress),
    }
  }
  // No motion: the paper simply scrolls away under the header.
  const bottom = (pin ?? portal).getBoundingClientRect().bottom
  const paper = smoothstep(64, 220, bottom)
  return { ink: paper, solid: 1 - paper }
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetLook } = useShelfLook()
  const { resetSections } = useSectionLooks()
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)

  // Publish the header's real height: the name portal slides up underneath
  // it by exactly that much, so the see-through header floats over it.
  useEffect(() => {
    const node = headerRef.current
    if (!node) return undefined
    const publish = () =>
      document.documentElement.style.setProperty('--header-actual', `${node.offsetHeight}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (!id) return undefined
    const node = document.getElementById(id)
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return undefined
  }, [location.hash, location.pathname])

  // The active section is the last one whose top has passed a line 35% down
  // the screen (none while still on the intro); the last one wins at the
  // very bottom of the page, where it may never reach that line.
  useEffect(() => {
    if (location.pathname !== '/') {
      headerRef.current?.style.setProperty('--paper', '0')
      headerRef.current?.style.setProperty('--solid', '1')
      return undefined
    }
    const ids = NAV.map((item) => item.hash.slice(1))
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 8)
      // Written straight to the element: it changes every scroll frame.
      const state = headerState()
      headerRef.current?.style.setProperty('--paper', state.ink.toFixed(3))
      headerRef.current?.style.setProperty('--solid', state.solid.toFixed(3))
      const line = window.innerHeight * 0.35
      let current = ''
      for (const id of ids) {
        const node = document.getElementById(id)
        if (node && node.getBoundingClientRect().top <= line) current = id
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      setActive(atBottom ? ids[ids.length - 1] : current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [location.pathname])

  const resetToDefault = () => {
    resetLook()
    resetSections()
    navigate('/')
  }

  return (
    <header
      ref={headerRef}
      className={[
        'press-header',
        scrolled ? 'press-header--scrolled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="press-brand">
        <button
          type="button"
          className="press-mark"
          aria-label="Reset the site to default colors, home"
          onClick={resetToDefault}
        >
          <Flower kind="sunflower" className="press-mark__sunflower" />
        </button>
      </div>
      <nav className="press-header__nav" aria-label="Sections">
        {NAV.map((item) => {
          const id = item.hash.slice(1)
          return (
            <a
              key={item.hash}
              className={`press-header__link${active === id && location.pathname === '/' ? ' is-active' : ''}`}
              href={item.hash}
              aria-current={active === id && location.pathname === '/' ? 'location' : undefined}
              onClick={(event) => {
                if (location.pathname === '/') return
                event.preventDefault()
                navigate(`/${item.hash}`)
              }}
            >
              {item.label}
            </a>
          )
        })}
        <ThemeButton />
      </nav>
    </header>
  )
}
