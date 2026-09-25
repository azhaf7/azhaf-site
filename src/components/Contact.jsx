import { useRef, useState } from 'react'
import { profile } from '../data/profile'
import SplitWords from './SplitWords'

// Contact, kept plain: the address (click to copy), a few links, and a short
// form. The site has no server, so sending opens the visitor's mail app with
// the message already written.
export default function Contact() {
  const formRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const subject = `Hello from ${name}`
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section className="min-section" id="contact" aria-labelledby="contact-title" data-reveal>
      <h2 id="contact-title" className="min-section__label">
        Contact
      </h2>
      <div className="min-section__body">
        <SplitWords
          as="p"
          className="min-lead"
          text="Have a project in mind? Say hello."
          delay={120}
        />

        <button type="button" className="min-email" onClick={copyEmail}>
          {profile.email}
          <span className="min-email__hint" aria-live="polite">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>

        <ul className="min-links">
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </li>
          <li>
            <a href={profile.cv} download="Azhaf-Khan-CV.pdf">
              CV ↓
            </a>
          </li>
        </ul>

        {sent ? (
          <p className="min-form__sent" role="status">
            Your mail app opened with the message ready. Press send there.{' '}
            <button
              type="button"
              className="min-link-button"
              onClick={() => {
                formRef.current?.reset()
                setSent(false)
              }}
            >
              Write another
            </button>
          </p>
        ) : (
          <form ref={formRef} className="min-form" onSubmit={onSubmit}>
            <label className="min-field">
              <span>Name</span>
              <input name="name" type="text" required autoComplete="name" />
            </label>
            <label className="min-field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="min-field min-field--wide">
              <span>Message</span>
              <textarea name="message" rows={3} required />
            </label>
            <button type="submit" className="min-submit">
              Send message →
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
