import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import s from './Dashboard.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const getInitials = name =>
  name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

export default function Dashboard() {
  const navigate = useNavigate()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const [urls,      setUrls]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState({ url: '', name: '' })
  const [formError, setFormError] = useState('')
  const [formLoad,  setFormLoad]  = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  const fetchUrls = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/dashboard/overview`, { headers: authHeaders() })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setUrls(data.urls || [])
    } catch {
      console.error('Failed to fetch URLs')
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
  fetchUrls();

  const interval = setInterval(fetchUrls, 3000);

  return () => clearInterval(interval);
}, [fetchUrls]);

  const handleAdd = async e => {
    e.preventDefault()
    setFormError('')
    setFormLoad(true)
    try {
      const res  = await fetch(`${API}/api/url/add`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.message || 'Failed to add URL.'); return }
      setShowModal(false)
      setForm({ url: '', name: '' })
      fetchUrls()
    } catch {
      setFormError('Could not connect to server.')
    } finally {
      setFormLoad(false)
    }
  }

  const handleDelete = async id => {
    setDeleteId(id)
    try {
      await fetch(`${API}/api/url/delete/${id}`, {
        method:  'DELETE',
        headers: authHeaders(),
      })
      setUrls(u => u.filter(x => x.id !== id))
    } finally {
      setDeleteId(null)
    }
  }

  const upCount   = urls.filter(u => u.status === 'up').length
  const downCount = urls.filter(u => u.status === 'down').length

  const ripple = e => {
    const btn  = e.currentTarget
    const el   = document.createElement('span')
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    el.style.cssText = `
      position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);pointer-events:none;
      animation:ripple 0.55s linear;
    `
    btn.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }

  return (
    <div className={s.page}>

      {/* ── Topbar ── */}
      <header className={s.topbar}>
        <div className={s.topbarLeft}>
          <Link to="/" className={s.logo}>PulseWatch</Link>
          <div className={s.topbarDivider} />
          <span className={s.topbarTag}>Dashboard</span>
        </div>
        <div className={s.topbarRight}>
          <div className={s.userChip}>
            <div className={s.userAvatar}>{getInitials(user.name)}</div>
            <span className={s.userName}>
              <span>{user.name || 'User'}</span>
            </span>
          </div>
          <button className={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className={s.main}>

        {/* Page header */}
        <div className={s.pageHeader}>
          <div className={s.pageTitleBlock}>
            <div className={s.pageEyebrow}>// Monitoring Console</div>
            <h1 className={s.pageTitle}>
              Your <em>URLs.</em>
            </h1>
            <p className={s.pageSubtitle}>
              {loading
                ? 'Fetching...'
                : `${urls.length} URL${urls.length !== 1 ? 's' : ''} under watch`}
            </p>
          </div>
          <button className={s.addBtn} onMouseDown={ripple} onClick={() => setShowModal(true)}>
            <span className={s.addBtnIcon}>+</span>
            Add URL
          </button>
        </div>

        {/* Stats */}
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <div className={s.statCardLabel}>Total URLs</div>
            <div className={s.statCardVal}>{urls.length}</div>
            <div className={`${s.statCardGlow} ${s.glowWhite}`} />
          </div>
          <div className={s.statCard}>
            <div className={s.statCardLabel}>Online</div>
            <div className={`${s.statCardVal} ${s.green}`}>{upCount}</div>
            <div className={`${s.statCardGlow} ${s.glowGreen}`} />
          </div>
          <div className={s.statCard}>
            <div className={s.statCardLabel}>Down</div>
            <div className={`${s.statCardVal} ${s.red}`}>{downCount}</div>
            <div className={`${s.statCardGlow} ${s.glowRed}`} />
          </div>
          <div className={s.statCard}>
            <div className={s.statCardLabel}>Check Interval</div>
            <div className={`${s.statCardVal} ${s.gold}`}>1m</div>
            <div className={`${s.statCardGlow} ${s.glowGold}`} />
          </div>
        </div>

        <div className={s.sectionLabel}>// {urls.length} monitored endpoint{urls.length !== 1 ? 's' : ''}</div>

        {/* URL list */}
        {loading ? (
          <div className={s.urlList}>
            {[1,2,3].map(i => <div key={i} className={s.loadingRow} />)}
          </div>
        ) : urls.length === 0 ? (
          <div className={s.emptyState}>
            <span className={s.emptyIcon}>📡</span>
            <div className={s.emptyTitle}>Nothing to watch yet.</div>
            <p className={s.emptyDesc}>
              Add your first URL and PulseWatch will begin<br/>monitoring it every minute, automatically.
            </p>
            <button className={s.addBtn} onMouseDown={ripple} onClick={() => setShowModal(true)}>
              <span className={s.addBtnIcon}>+</span>
              Add your first URL
            </button>
          </div>
        ) : (
          <div className={s.urlList}>
            {urls.map((u, i) => (
              <div
                key={u.id}
                className={`${s.urlCard} ${u.status === 'up' ? s.urlCardUp : u.status === 'down' ? s.urlCardDown : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/logs/${u.id}`)}
              >
                <div className={s.urlCardLeft}>
                  <div className={`${s.statusDot} ${
                    u.status === 'up'   ? s.dotUp   :
                    u.status === 'down' ? s.dotDown : s.dotUnknown
                  }`} />
                  <div className={s.urlInfo}>
                    <div className={s.urlName}>{u.name || u.url}</div>
                    <div className={s.urlAddress}>{u.url}</div>
                  </div>
                </div>

                <div className={s.urlCardRight}>
                  {u.last_response_time_ms && (
                    <div className={s.urlMeta}>
                      <span className={s.urlMetaVal}>{u.last_response_time_ms}ms</span>
                      <span className={s.urlMetaLabel}>Response</span>
                    </div>
                  )}
                  {u.last_checked && (
                    <div className={s.urlMeta}>
                      <span className={s.urlMetaVal}>
                        {new Date(u.last_checked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={s.urlMetaLabel}>Last check</span>
                    </div>
                  )}
                  <span className={`${s.statusBadge} ${
                    u.status === 'up'   ? s.badgeUp   :
                    u.status === 'down' ? s.badgeDown : s.badgeUnknown
                  }`}>
                    {u.status || 'pending'}
                  </span>

                  <div className={s.urlActions} onClick={e => e.stopPropagation()}>
                    <button
                      className={s.actionBtn}
                      onClick={() => handleDelete(u.id)}
                      disabled={deleteId === u.id}
                      title="Delete"
                    >
                      {deleteId === u.id ? '…' : '✕'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add URL Modal ── */}
      {showModal && (
        <div className={s.overlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>

            <div className={s.modalHeader}>
              <div className={s.modalTitleBlock}>
                <div className={s.modalEyebrow}>// New endpoint</div>
                <div className={s.modalTitle}>Add a URL</div>
              </div>
              <button className={s.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleAdd}>
              <div className={s.modalBody}>
                {formError && (
                  <div className={`${s.alertBox} ${s.alertError}`}>{formError}</div>
                )}
                <div className={s.field}>
                  <label className={s.label}>URL</label>
                  <input
                    className={s.input}
                    type="url"
                    placeholder="https://yoursite.com"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Display Name <span style={{opacity:0.4}}>(optional)</span></label>
                  <input
                    className={s.input}
                    type="text"
                    placeholder="My Website"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className={s.modalFooter}>
                <button type="button" className={s.btnGhost} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className={s.btnPrimary} type="submit" disabled={formLoad} onMouseDown={ripple}>
                  {formLoad
                    ? <><span className={s.spinner} />Adding...</>
                    : 'Start monitoring →'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Ripple keyframe injected once */}
      <style>{`@keyframes ripple{to{transform:scale(4);opacity:0}}`}</style>
    </div>
  )
}
