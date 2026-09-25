import { usePointerVars } from '../utils/motion'

// A soft reading-lamp glow that follows the pointer across the paper. It is
// pure CSS driven by --mx/--my; this component only publishes the variables.
export default function CursorGlow() {
  usePointerVars()
  return <div className="cursor-glow" aria-hidden="true" />
}
