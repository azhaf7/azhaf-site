function SunflowerSvg() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="16.5"
          rx="5.2"
          ry="11.5"
          fill="#D4A24A"
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="9.2" fill="#6B4A1A" />
      <circle cx="32" cy="32" r="6.4" fill="#3F2A10" />
    </>
  )
}

function DaisySvg() {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="18"
          rx="6"
          ry="12.5"
          fill="#F4F1E8"
          stroke="#6B4A1A"
          strokeWidth="1.2"
          transform={`rotate(${i * 36} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#E0B429" />
    </>
  )
}

function BlossomSvg() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="20"
          rx="8"
          ry="13"
          fill="#F2C9D8"
          stroke="#C45A7A"
          strokeWidth="1.1"
          transform={`rotate(${i * 72} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="7" fill="#F6E39A" />
    </>
  )
}

function TulipSvg() {
  return (
    <>
      <path
        d="M32 54 C22 42 18 28 24 18 C28 22 32 16 32 12 C32 16 36 22 40 18 C46 28 42 42 32 54 Z"
        fill="#E07A9A"
      />
      <path d="M32 54 C28 40 30 30 32 22 C34 30 36 40 32 54 Z" fill="#C44A6A" />
    </>
  )
}

function PoppySvg() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="20"
          rx="9"
          ry="14"
          fill="#D94A4A"
          transform={`rotate(${i * 60} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="7.5" fill="#2A1810" />
      <circle cx="32" cy="32" r="4" fill="#E0B429" />
    </>
  )
}

function CosmosSvg() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="17"
          rx="5"
          ry="13"
          fill="#C9B4F0"
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="7" fill="#F0D24A" />
    </>
  )
}

function LilySvg() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d="M32 34 C28 24 26 14 32 8 C38 14 36 24 32 34 Z"
          fill="#F4F1E8"
          stroke="#6B4A1A"
          strokeWidth="1.1"
          transform={`rotate(${i * 60} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="4.5" fill="#E0B429" />
    </>
  )
}

function MarigoldSvg() {
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="18"
          rx="3.6"
          ry="12"
          fill={i % 2 ? '#E08A20' : '#F0C24A'}
          transform={`rotate(${i * 22.5} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="7" fill="#C45A12" />
    </>
  )
}

function HibiscusSvg() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="19"
          rx="9.5"
          ry="15"
          fill="#E45A7A"
          transform={`rotate(${i * 72} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="5.5" fill="#F0D24A" />
      <path d="M32 32 C34 24 38 16 40 10" fill="none" stroke="#6B4A1A" strokeWidth="1.6" />
    </>
  )
}

const KINDS = {
  sunflower: SunflowerSvg,
  daisy: DaisySvg,
  blossom: BlossomSvg,
  tulip: TulipSvg,
  poppy: PoppySvg,
  cosmos: CosmosSvg,
  lily: LilySvg,
  marigold: MarigoldSvg,
  hibiscus: HibiscusSvg,
}

export const FLOWER_KINDS = Object.keys(KINDS)

export function Flower({ kind = 'sunflower', className = '' }) {
  const Glyph = KINDS[kind] ?? SunflowerSvg
  return (
    <svg
      className={['flower', className].filter(Boolean).join(' ')}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <Glyph />
    </svg>
  )
}

export default function Sunflower({ className = '' }) {
  return <Flower kind="sunflower" className={className} />
}

function TittleLetter({ letter, kind, onBloomClick, bloomLabel }) {
  const stem = letter === 'i' || letter === 'I' ? 'ı' : letter
  const bloom = <Flower kind={kind} />

  return (
    <span className="tittle-i">
      <span className="tittle-i__stem">{stem}</span>
      {onBloomClick ? (
        <button
          type="button"
          className="tittle-i__bloom tittle-i__bloom--btn"
          aria-label={bloomLabel}
          onClick={onBloomClick}
        >
          {bloom}
        </button>
      ) : (
        <span className="tittle-i__bloom">{bloom}</span>
      )}
    </span>
  )
}

export function FlowerHeading({
  text,
  kind = 'sunflower',
  as: Tag = 'h2',
  className,
  id,
  onBloomClick,
  bloomLabel,
}) {
  const chars = Array.from(text)
  const iIndex = chars.findIndex((char) => char === 'i')
  const markIndex = iIndex >= 0 ? iIndex : chars.length - 1

  return (
    <Tag id={id} className={className} aria-label={text}>
      {chars.map((char, index) =>
        index === markIndex ? (
          <TittleLetter
            key={`${char}-${index}`}
            letter={char}
            kind={kind}
            onBloomClick={onBloomClick}
            bloomLabel={bloomLabel ?? `Change ${text} colors`}
          />
        ) : (
          char
        ),
      )}
    </Tag>
  )
}
