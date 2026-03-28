 import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import s from './Logs.module.css'
import PulseLoader       from '../{styles,pages,components}/PulseLoader'
import ResponseTimeChart from '../{styles,pages,components}/ResponseTimeChart'
import TrafficChart      from '../{styles,pages,components}/TrafficChart'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export default function Logs() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [logs,             setLogs]            = useState([])
  const [stats,            setStats]           = useState(null)
  const [urlInfo,          setUrlInfo]         = useState(null)
  const [trafficData,      setTrafficData]     = useState(null)
  const [loading,          setLoading]         = useState(true)
  const [minLoading,       setMinLoading]      = useState(true)
  const [fromDate,         setFromDate]        = useState('')
  const [toDate,           setToDate]          = useState('')
  const [limit,            setLimit]           = useState(50)
  const [uptime,           setUptime]          = useState(null)
  const [trend,            setTrend]           = useState(null)
  const [changePercentage, setChangePercentage] = useState(0)
  const [previousUptime,   setPreviousUptime]  = useState(null)
  const [chartTab,         setChartTab]        = useState('response')

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('limit', limit)
      if (fromDate) params.set('from', fromDate)
      if (toDate)   params.set('to',   toDate)

      // Run all three fetches in parallel
      const [logsRes, trafficRes, uptimeRes] = await Promise.all([
        fetch(`${API}/api/dashboard/logs/${id}?${params.toString()}`, { headers: authHeaders() }),
        fetch(`${API}/api/traffic/data/${id}`,                        { headers: authHeaders() }),
        fetch(`${API}/api/dashboard/uptime/${id}`,                    { headers: authHeaders() }),
      ])

      if (logsRes.status === 401) { navigate('/login'); return }

      const data = await logsRes.json()
      setLogs(data.logs   || [])
      setStats(data.stats || null)
      setUrlInfo(data.url || null)

      if (trafficRes.ok) {
        const traffic = await trafficRes.json()
        setTrafficData(traffic)
      } else {
        setTrafficData(null)
      }

      if (uptimeRes.ok) {
        const ud = await uptimeRes.json()
        setUptime(ud.uptime_percentage ?? null)
        setTrend(ud.trend ?? null)
        setChangePercentage(ud.change_percentage ?? 0)
        setPreviousUptime(ud.previous_uptime ?? null)
      }

    } catch (err) {
      console.error('Failed to fetch logs', err)
    } finally {
      setLoading(false)
    }
  }, [id, navigate, limit, fromDate, toDate])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    const t = setTimeout(() => setMinLoading(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const isSuccess  = code => code >= 200 && code < 400
  const hasFilters = fromDate || toDate || limit !== 50
  const clearFilters = () => { setFromDate(''); setToDate(''); setLimit(50) }

  const exportCSV = () => {
    if (!logs.length) return
    const headers = ["Status", "Status Code", "Response Time (ms)", "Checked At", "Error"]
    const rows = logs.map(log => [
      isSuccess(log.status_code) ? "UP" : "DOWN",
      log.status_code ?? '',
      log.response_time_ms ?? '',
      new Date(log.checked_at).toISOString(),
      log.error_message ?? '',
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `logs-${id}.csv`
    a.click()
  }

  const uptimeColor = uptime === null ? 'rgba(255,255,255,0.4)'
                    : uptime >= 99    ? '#34d399'
                    : uptime >= 95    ? '#c9a96e'
                    : uptime >= 90    ? '#fbbf24'
                    :                   '#f87171'

  const trendIcon  = trend === 'up'      ? '↑'
                   : trend === 'down'    ? '↓'
                   : trend === 'neutral' ? '—'
                   : null

  const trendColor = trend === 'up'   ? '#34d399'
                   : trend === 'down' ? '#f87171'
                   :                    'rgba(255,255,255,0.35)'

  if (loading || minLoading) return (
    <div style={{
      minHeight: '100vh', background: '#07090f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#f0e6d0' }}>
        PulseWatch
      </span>
      <PulseLoader color="#c9a96e" width={280} height={56} />
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: '10px',
        color: 'rgba(255,255,255,0.22)', letterSpacing: '3px', textTransform: 'uppercase',
      }}>Loading logs...</span>
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

        {/* Page header */}
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.pageTitle}>
              Logs for <span>{urlInfo?.name || urlInfo?.url || `URL #${id}`}</span>
            </h1>
            {urlInfo && <div className={s.urlLabel}>{urlInfo.url}</div>}
          </div>

          {/* Uptime chip */}
          {uptime !== null && (
            <div className={s.uptimeChip}>
              <div className={s.uptimeMain}>
                <span className={s.uptimePct} style={{ color: uptimeColor }}>
                  {uptime.toFixed(2)}%
                </span>
                <span className={s.uptimeLabel}>uptime · last 7 days</span>
              </div>
              {trendIcon && (
                <div className={s.uptimeTrend} style={{ color: trendColor }}>
                  <span className={s.trendIcon}>{trendIcon}</span>
                  <span className={s.trendChange}>
                    {changePercentage > 0 && '+'}{changePercentage.toFixed(2)}%
                  </span>
                  {previousUptime !== null && (
                    <span className={s.trendPrev}>vs {previousUptime.toFixed(2)}% prev week</span>
                  )}
                </div>
              )}
            </div>
          )}
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

        {/* Chart tabs */}
        {logs.length > 0 && (
          <div className={s.chartSection} data-aos="fade-up">
            <div className={s.chartTabs}>
              <button
                className={`${s.chartTab} ${chartTab === 'response' ? s.chartTabActive : ''}`}
                onClick={() => setChartTab('response')}
              >
                📈 Response Time
              </button>
              <button
                className={`${s.chartTab} ${chartTab === 'traffic' ? s.chartTabActive : ''}`}
                onClick={() => setChartTab('traffic')}
              >
                👥 Traffic
                {!trafficData && <span className={s.chartTabLock}> · No data</span>}
              </button>
            </div>

            <div className={s.chartBody}>
              {chartTab === 'response' && <ResponseTimeChart logs={logs} />}
              {chartTab === 'traffic' && (
                !trafficData || trafficData.summary?.totalVisits === 0 ? (
                  <div className={s.emptyState}>
                    <div style={{ fontSize: '14px', marginBottom: '6px' }}>No traffic data yet 👀</div>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>
                      Add the tracking script to your site to start collecting data.
                    </span>
                    <code style={{ display: 'block', marginTop: '10px', fontSize: '10px', opacity: 0.5 }}>
                      {`<script src="${API}/api/traffic/snippet/${id}" async></script>`}
                    </code>
                  </div>
                ) : (
                  <TrafficChart data={trafficData} />
                )
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={s.filtersRow} data-aos="fade-up">
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>From</label>
            <input type="date" className={s.dateInput} value={fromDate}
              max={toDate || undefined} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>To</label>
            <input type="date" className={s.dateInput} value={toDate}
              min={fromDate || undefined} onChange={e => setToDate(e.target.value)} />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Show</label>
            <div className={s.limitBtns}>
              {[10, 25, 50, 100].map(n => (
                <button key={n}
                  className={`${s.limitBtn} ${limit === n ? s.limitBtnActive : ''}`}
                  onClick={() => setLimit(n)}>{n}</button>
              ))}
            </div>
          </div>
          {hasFilters && <button className={s.clearBtn} onClick={clearFilters}>× Clear</button>}
          <button className={s.exportBtn} onClick={exportCSV}>↓ CSV</button>
          <div className={s.filterMeta}>
            Showing <strong>{logs.length}</strong> logs
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
            {logs.length === 0 ? (
              <div className={s.emptyState}>
                {hasFilters ? 'No logs match your filters.' : 'No logs yet.'}
              </div>
            ) : (
              logs.map((log, i) => (
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