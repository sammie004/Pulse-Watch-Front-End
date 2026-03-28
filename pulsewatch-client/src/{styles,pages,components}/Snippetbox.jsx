import { useState } from 'react'
import s from './Snippetbox.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export default function SnippetBox({ urlId }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('script')
  const [wrappedLink, setWrappedLink] = useState('')
  const [loadingLink, setLoadingLink] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [copied, setCopied] = useState('')

  const scriptSnippet =
    `<script src="${API}/api/traffic/snippet/${urlId}" async></script>`

  const fetchWrappedLink = async () => {
    setTab('link')
    if (wrappedLink) return

    setLoadingLink(true)
    setLinkError('')

    try {
      const res = await fetch(`${API}/api/traffic/wrap`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ url_id: urlId }),
      })

      const data = await res.json()

      // If the response is not OK, show the backend message
      if (!res.ok) {
        console.error('Backend error:', data)
        setLinkError(data.message || 'Failed to generate wrapped link')
        return
      }

      if (!data.wrapped_url) {
        setLinkError('Wrapped URL not returned from server')
        return
      }

      setWrappedLink(data.wrapped_url)
    } catch (err) {
      console.error('Fetch wrapped link error:', err)
      setLinkError('Could not connect to server.')
    } finally {
      setLoadingLink(false)
    }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  return (
    <div className={s.wrap}>
      {/* ── Toggle button ── */}
      <button
        className={`${s.toggle} ${open ? s.toggleOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={s.toggleIcon}>📡</span>
        <span className={s.toggleLabel}>Track visitors</span>
        <span className={s.toggleChevron}>{open ? '▲' : '▼'}</span>
      </button>

      {/* ── Expanded panel ── */}
      {open && (
        <div className={s.panel}>
          {/* Tabs */}
          <div className={s.tabs}>
            <button
              className={`${s.tabBtn} ${tab === 'script' ? s.tabActive : ''}`}
              onClick={() => setTab('script')}
            >
              Script embed
            </button>
            <button
              className={`${s.tabBtn} ${tab === 'link' ? s.tabActive : ''}`}
              onClick={fetchWrappedLink}
            >
              Wrapped link
            </button>
          </div>

          {/* Script tab */}
          {tab === 'script' && (
            <div className={s.tabBody}>
              <p className={s.desc}>
                Paste before the <code className={s.code}>&lt;/body&gt;</code> tag
                on your site. Every page view will be tracked automatically.
              </p>
              <div className={s.snippetRow}>
                <pre className={s.snippet}>{scriptSnippet}</pre>
                <button
                  className={`${s.copyBtn} ${copied === 'script' ? s.copied : ''}`}
                  onClick={() => copy(scriptSnippet, 'script')}
                >
                  {copied === 'script' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Wrapped link tab */}
          {tab === 'link' && (
            <div className={s.tabBody}>
              <p className={s.desc}>
                Share this link instead of your real URL. Every click is tracked —
                no code changes needed on your site.
              </p>

              {loadingLink ? (
                <div className={s.loading}>Generating link...</div>
              ) : linkError ? (
                <div className={s.error}>
                  ⚠ {linkError}
                </div>
              ) : wrappedLink ? (
                <div className={s.snippetRow}>
                  <pre className={s.snippet}>{wrappedLink}</pre>
                  <button
                    className={`${s.copyBtn} ${copied === 'link' ? s.copied : ''}`}
                    onClick={() => copy(wrappedLink, 'link')}
                  >
                    {copied === 'link' ? '✓' : 'Copy'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}