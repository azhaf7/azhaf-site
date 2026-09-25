import { useEffect } from 'react'

// Marks [data-reveal] elements with .is-inview the first time they scroll
// into view. Also picks up elements mounted later (e.g. the hero inside the
// name portal, which renders once its font has loaded).
export function useScrollReveal(rootRef, deps = []) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seen = new WeakSet()

    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return
              entry.target.classList.add('is-inview')
              io.unobserve(entry.target)
            })
          },
          { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
        )

    const watch = () => {
      root.querySelectorAll('[data-reveal]').forEach((node) => {
        if (seen.has(node)) return
        seen.add(node)
        if (reduce) node.classList.add('is-inview')
        else if (!node.classList.contains('is-inview')) io.observe(node)
      })
    }

    watch()
    const mutations = new MutationObserver(watch)
    mutations.observe(root, { childList: true, subtree: true })
    return () => {
      mutations.disconnect()
      io?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
