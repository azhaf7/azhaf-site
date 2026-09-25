import { useEffect, useState } from 'react'

// Measures the row's natural (unscaled) size against its wrapper's available
// width and returns a scale <= 1 so the row always fits without needing
// horizontal scroll, regardless of window size or zoom level.
export function useFitScale(wrapperRef, rowRef, deps = []) {
  const [scale, setScale] = useState(1)
  const [naturalHeight, setNaturalHeight] = useState(0)
  // Starts false so the wrapper's CSS `overflow: hidden` still guards the
  // one unmeasured frame before scale is known (prevents a flash of
  // full-size, unscaled content). Once true, callers should switch that
  // wrapper to overflow: visible — its height is pinned to the row's
  // *resting* size, and clipping permanently would cut off anything that
  // legitimately animates past that box, like a shelf book lifting on hover.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const row = rowRef.current
    if (!wrapper || !row) return undefined

    const measure = () => {
      const available = wrapper.clientWidth
      // scrollWidth/scrollHeight reflect the row's true content extent even
      // while it's overflowing its own box — offsetWidth would just report
      // the already-clamped visible box, which defeats the measurement.
      const naturalWidth = row.scrollWidth
      if (!naturalWidth) return
      setNaturalHeight(row.scrollHeight)
      setScale(Math.min(1, available / naturalWidth))
      setReady(true)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    ro.observe(row)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { scale, naturalHeight, ready }
}
