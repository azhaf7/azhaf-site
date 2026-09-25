import { useEffect, useRef } from 'react'

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  return window.matchMedia('(pointer: fine)').matches
}

// Marks [data-reveal] descendants with .is-in the first time they scroll into
// view. Children get a stagger from their index unless they set --i already.
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const targets = [...root.querySelectorAll('[data-reveal]')]
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

// Publishes the pointer position as --mx/--my (px) and --mxn/--myn (-1..1)
// on <html>, throttled to one write per frame.
export function usePointerVars() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined
    const root = document.documentElement
    let x = innerWidth / 2
    let y = innerHeight / 2
    let frame = 0
    const write = () => {
      frame = 0
      root.style.setProperty('--mx', `${x}px`)
      root.style.setProperty('--my', `${y}px`)
      root.style.setProperty('--mxn', ((x / innerWidth) * 2 - 1).toFixed(3))
      root.style.setProperty('--myn', ((y / innerHeight) * 2 - 1).toFixed(3))
    }
    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
      if (!frame) frame = requestAnimationFrame(write)
    }
    write()
    root.classList.add('has-pointer')
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
      root.classList.remove('has-pointer')
    }
  }, [])
}

// Lets an element lean toward the pointer while hovered: sets --tx/--ty on
// it (px), eased back to 0 on leave.
export function useMagnetic(ref, strength = 0.28) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined
    const onMove = (event) => {
      const r = el.getBoundingClientRect()
      const dx = event.clientX - (r.left + r.width / 2)
      const dy = event.clientY - (r.top + r.height / 2)
      el.style.setProperty('--tx', `${(dx * strength).toFixed(1)}px`)
      el.style.setProperty('--ty', `${(dy * strength).toFixed(1)}px`)
    }
    const onLeave = () => {
      el.style.setProperty('--tx', '0px')
      el.style.setProperty('--ty', '0px')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, strength])
}

// Tilts a 3D stage toward the pointer while it is over the given area.
export function useTilt(areaRef, stageRef, { maxY = 4, maxX = 2.5 } = {}) {
  const frame = useRef(0)
  useEffect(() => {
    const area = areaRef.current
    const stage = stageRef.current
    if (!area || !stage || !hasFinePointer() || prefersReducedMotion()) return undefined
    let rx = 0
    let ry = 0
    const apply = () => {
      frame.current = 0
      stage.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`)
      stage.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`)
    }
    const onMove = (event) => {
      const r = area.getBoundingClientRect()
      const nx = ((event.clientX - r.left) / r.width) * 2 - 1
      const ny = ((event.clientY - r.top) / r.height) * 2 - 1
      ry = Math.max(-1, Math.min(1, nx)) * maxY
      rx = -Math.max(-1, Math.min(1, ny)) * maxX
      if (!frame.current) frame.current = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      rx = 0
      ry = 0
      if (!frame.current) frame.current = requestAnimationFrame(apply)
    }
    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerleave', onLeave)
    return () => {
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [areaRef, stageRef, maxX, maxY])
}

// Splits a sentence into word spans so each can animate in with a delay.
export function Words({ text, from = 0 }) {
  return text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`} className="word" style={{ '--i': from + i }}>
      {word}
      {i < text.split(' ').length - 1 ? ' ' : ''}
    </span>
  ))
}
