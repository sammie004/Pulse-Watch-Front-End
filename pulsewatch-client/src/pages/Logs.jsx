import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import s from './Logs.module.css'
import PulseLoader from '../{styles,pages,components}/PulseLoader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export default function Logs() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [logs,     setLogs]     = useState([])
  const [stats,    setStats]    = useState(null)
  const [urlInfo,  setUrlInfo]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate,   setToDate]   = useState('')
  const [limit,    setLimit]    = useState(50)

const fetchData = useCallback(async () => {
  try {
    // Build query string from active filters
    const params = new URLSearchParams()
    params.set('limit', limit)
    if (fromDate) params.set('from', fromDate)
    if (toDate)   params.set('to',   toDate)

    const res = await fetch(
      `${API}/api/dashboard/logs/${id}?${params.toString()}`,
      { headers: authHeaders() }
    )
    if (res.status === 401) { navigate('/login'); return }
    const data = await res.json()
    setLogs(data.logs   || [])
    setStats(data.stats || null)
    setUrlInfo(data.url || null)
  } catch {
    console.error('Failed to fetch logs')
  } finally {
    setLoading(false)
  }
}, [id, navigate, limit, fromDate, toDate])  // ← add limit, fromDate, toDate here

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const isSuccess = code => code >= 200 && code < 400

  // ── Filter logic ──────────────────────────────────────────────────────────
  // Parse date inputs as local midnight to avoid UTC offset issues
  const toLocalMidnight = dateStr => {
    if (!dateStr) return null
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
  }

  const toLocalEndOfDay = dateStr => {
    if (!dateStr) return null
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
  }

  const filteredLogs = logs.filter(log => {
    const time = new Date(log.checked_at).getTime()
    const from = toLocalMidnight(fromDate)
    const to   = toLocalEndOfDay(toDate)
    if (from && time < from) return false
    if (to   && time > to)   return false
    return true
  }).slice(0, limit)

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setLimit(50)
  }

  const hasFilters = fromDate || toDate || limit !== 50

  // ── Full page loader ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#07090f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#f0e6d0' }}>
        PulseWatch
      </span>
      <PulseLoader color="#c9a96e" width={280} height={56} />
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        color: 'rgba(255,255,255,0.22)',
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}>
        Loading logs...
      </span>
    </div>
  )

  return (
    <div className={s.page}>

      <header className={s.topbar}>
        <div className={s.topbarLeft}>
          <Link to="/" className={s.logo}>PulseWatch</Link>
          <button className={s.backBtn} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </header>

      <main className={s.main}>

        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>
            Logs for <span>{urlInfo?.name || urlInfo?.url || `URL #${id}`}</span>
          </h1>
          {urlInfo && <div className={s.urlLabel}>{urlInfo.url}</div>}
        </div>

        {/* Stats */}
        <div className={s.statsRow}>
          <div className={s.statCard} data-aos="slide-up">
            <div className={s.statLabel}>Total Checks</div>
            <div className={s.statVal}>{stats?.totalChecks || 0}</div>
          </div>
          <div className={s.statCard} data-aos="slide-up" data-aos-delay="100">
            <div className={s.statLabel}>Successful</div>
            <div className={`${s.statVal} ${s.green}`}>{stats?.upChecks || 0}</div>
          </div>
          <div className={s.statCard} data-aos="slide-up" data-aos-delay="200">
            <div className={s.statLabel}>Failed</div>
            <div className={`${s.statVal} ${s.red}`}>{stats?.downChecks || 0}</div>
          </div>
          <div className={s.statCard} data-aos="slide-up" data-aos-delay="300">
            <div className={s.statLabel}>Avg Response</div>
            <div className={`${s.statVal} ${s.gold}`}>{stats?.avgResponse || 0}ms</div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className={s.filtersRow} data-aos="fade-up">

          <div className={s.filterGroup}>
            <label className={s.filterLabel}>From</label>
            <input
              type="date"
              className={s.dateInput}
              value={fromDate}
              max={toDate || undefined}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className={s.filterGroup}>
            <label className={s.filterLabel}>To</label>
            <input
              type="date"
              className={s.dateInput}
              value={toDate}
              min={fromDate || undefined}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Show</label>
            <div className={s.limitBtns}>
              {[10, 25, 50, 100].map(n => (
                <button
                  key={n}
                  className={`${s.limitBtn} ${limit === n ? s.limitBtnActive : ''}`}
                  onClick={() => setLimit(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className={s.clearBtn} onClick={clearFilters}>
              × Clear
            </button>
          )}

          <div className={s.filterMeta}>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> logs
          </div>

        </div>

        {/* Log table */}
        <div className={s.tableWrap} data-aos="zoom-in">
          <div className={s.tableHeader}>
            <div className={s.tableHeaderCell}>Status</div>
            <div className={s.tableHeaderCell}>Code</div>
            <div className={s.tableHeaderCell}>Response Time</div>
            <div className={s.tableHeaderCell}>Checked At</div>
          </div>

          <div className={s.tableBody}>
            {filteredLogs.length === 0 ? (
              <div className={s.emptyState}>
                {hasFilters
                  ? 'No logs match your filters — try adjusting the date range.'
                  : 'No logs yet — checks will appear here.'}
              </div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className={s.tableRow}>
                  <div>
                    {log.error_message ? (
                      <span className={s.errorText}>{log.error_message}</span>
                    ) : (
                      <span className={`${s.statusBadge} ${isSuccess(log.status_code) ? s.badgeUp : s.badgeDown}`}>
                        {isSuccess(log.status_code) ? 'UP' : 'DOWN'}
                      </span>
                    )}
                  </div>
                  <div className={s.cellMono}>{log.status_code || '—'}</div>
                  <div className={s.cellMono}>{log.response_time_ms}ms</div>
                  <div className={s.cellDim}>
                    {new Date(log.checked_at).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  )
}