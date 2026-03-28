import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import s from './TrafficChart.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={s.tooltip}>
      <div className={s.tooltipTime}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: p.color }} />
          <span className={s.tooltipKey}>{p.name}:</span>
          <span className={s.tooltipVal}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrafficChart({ data }) {
  const [metric, setMetric] = useState('total') // 'total' | 'unique' | 'both'
  const [view,   setView]   = useState('daily') // 'daily' | 'hourly'

  // if (!data) return null

  const { dailyVisits, peakHours, summary, sources } = data

  const totalVisits    = summary?.totalVisits    || 0
  const uniqueVisitors = summary?.uniqueVisitors || 0
  const returning      = Math.max(0, totalVisits - uniqueVisitors)
  const peakHour       = peakHours?.reduce(
    (a, b) => b.visits > a.visits ? b : a,
    { visits: 0, label: '—' }
  )

  // Format date labels to be shorter
  const formattedDaily = (dailyVisits || []).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className={s.wrap}>

      {/* ── Header ── */}
      <div className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.eyebrow}>// Visitor Traffic</div>
          <div className={s.title}>Traffic analytics</div>
        </div>
        <div className={s.controls}>
          {/* View toggle */}
          <div className={s.toggle}>
            <button
              className={`${s.toggleBtn} ${view === 'daily' ? s.toggleActive : ''}`}
              onClick={() => setView('daily')}
            >Daily</button>
            <button
              className={`${s.toggleBtn} ${view === 'hourly' ? s.toggleActive : ''}`}
              onClick={() => setView('hourly')}
            >Peak hours</button>
          </div>
          {/* Metric toggle — only for daily view */}
          {view === 'daily' && (
            <div className={s.toggle}>
              <button
                className={`${s.toggleBtn} ${metric === 'total' ? s.toggleActive : ''}`}
                onClick={() => setMetric('total')}
              >Total</button>
              <button
                className={`${s.toggleBtn} ${metric === 'unique' ? s.toggleActive : ''}`}
                onClick={() => setMetric('unique')}
              >Unique</button>
              <button
                className={`${s.toggleBtn} ${metric === 'both' ? s.toggleActive : ''}`}
                onClick={() => setMetric('both')}
              >Both</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className={s.statsRow}>
        <div className={s.statItem}>
          <span className={s.statVal} style={{ color: '#c9a96e' }}>{totalVisits.toLocaleString()}</span>
          <span className={s.statLabel}>Total visits</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statItem}>
          <span className={s.statVal} style={{ color: '#34d399' }}>{uniqueVisitors.toLocaleString()}</span>
          <span className={s.statLabel}>Unique</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statItem}>
          <span className={s.statVal} style={{ color: 'rgba(255,255,255,0.5)' }}>{returning.toLocaleString()}</span>
          <span className={s.statLabel}>Returning</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.statItem}>
          <span className={s.statVal} style={{ color: '#7dd3fc' }}>{peakHour?.label}</span>
          <span className={s.statLabel}>Peak hour</span>
        </div>
        {/* Source breakdown */}
        {sources?.length > 0 && (
          <>
            <div className={s.statDivider} />
            <div className={s.sourcesWrap}>
              {sources.map((src, i) => (
                <div key={i} className={s.sourceItem}>
                  <span className={s.sourceDot} style={{
                    background: src.source === 'wrapped_link' ? '#7dd3fc' : '#c9a96e'
                  }} />
                  <span className={s.sourceLabel}>
                    {src.source === 'wrapped_link' ? 'Link' : 'Script'}:
                  </span>
                  <span className={s.sourceCount}>{src.visits}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Chart ── */}
      <div className={s.chartWrap}>
        {view === 'daily' ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={formattedDaily} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c9a96e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c9a96e" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34d399" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono' }}
                tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono' }}
                tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<CustomTooltip />} />
              {(metric === 'total' || metric === 'both') && (
                <Area type="monotone" dataKey="total" name="Total"
                  stroke="#c9a96e" strokeWidth={2} fill="url(#totalGrad)"
                  dot={false} activeDot={{ r: 4, fill: '#c9a96e', stroke: 'rgba(201,169,110,0.3)', strokeWidth: 5 }} />
              )}
              {(metric === 'unique' || metric === 'both') && (
                <Area type="monotone" dataKey="unique_visitors" name="Unique"
                  stroke="#34d399" strokeWidth={2} fill="url(#uniqueGrad)"
                  dot={false} activeDot={{ r: 4, fill: '#34d399', stroke: 'rgba(52,211,153,0.3)', strokeWidth: 5 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'DM Mono' }}
                tickLine={false} axisLine={false} interval={2} />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono' }}
                tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visits" name="Visits"
                fill="rgba(125,211,252,0.3)" stroke="rgba(125,211,252,0.6)"
                strokeWidth={1} radius={[3, 3, 0, 0]}
                activeBar={{ fill: 'rgba(125,211,252,0.55)' }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}