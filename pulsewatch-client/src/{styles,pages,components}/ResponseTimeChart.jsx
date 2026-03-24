import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import s from './ResponseTimeChart.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const isDown = d.payload.isDown

  return (
    <div className={s.tooltip}>
      <div className={s.tooltipTime}>{label}</div>
      <div className={s.tooltipRow}>
        <span
          className={s.tooltipDot}
          style={{ background: isDown ? '#f87171' : '#34d399' }}
        />
        <span className={s.tooltipLabel}>
          {isDown ? 'DOWN' : `${d.value}ms`}
        </span>
      </div>
      {d.payload.status_code && (
        <div className={s.tooltipCode}>HTTP {d.payload.status_code}</div>
      )}
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  if (!payload.isDown) return null
  return (
    <circle
      cx={cx} cy={cy} r={4}
      fill="#f87171"
      stroke="rgba(248,113,113,0.3)"
      strokeWidth={6}
    />
  )
}

export default function ResponseTimeChart({ logs }) {
  if (!logs || logs.length === 0) return null

  // Build chart data — oldest first
  const data = [...logs].reverse().map(log => {
    const isDown = log.status_code === 0 || log.status_code >= 400 || !!log.error_message
    return {
      time: new Date(log.checked_at).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit',
      }),
      fullTime: new Date(log.checked_at).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
      responseTime: isDown ? 0 : (log.response_time_ms || 0),
      status_code:  log.status_code,
      isDown,
    }
  })

  const maxVal   = Math.max(...data.map(d => d.responseTime), 100)
  const avgVal   = Math.round(
    data.filter(d => !d.isDown).reduce((a, d) => a + d.responseTime, 0) /
    Math.max(data.filter(d => !d.isDown).length, 1)
  )
  const downCount = data.filter(d => d.isDown).length

  // Show every Nth label to avoid crowding
  const labelEvery = Math.ceil(data.length / 8)

  return (
    <div className={s.wrap}>

      {/* Header */}
      <div className={s.header}>
        <div className={s.titleBlock}>
          <div className={s.eyebrow}>// Response Time</div>
          <div className={s.title}>Performance over time</div>
        </div>
        <div className={s.metaRow}>
          <div className={s.metaItem}>
            <span className={s.metaVal} style={{ color: '#c9a96e' }}>{avgVal}ms</span>
            <span className={s.metaLabel}>Avg</span>
          </div>
          <div className={s.metaDivider} />
          <div className={s.metaItem}>
            <span className={s.metaVal} style={{ color: '#34d399' }}>{maxVal}ms</span>
            <span className={s.metaLabel}>Peak</span>
          </div>
          <div className={s.metaDivider} />
          <div className={s.metaItem}>
            <span
              className={s.metaVal}
              style={{ color: downCount > 0 ? '#f87171' : '#34d399' }}
            >
              {downCount}
            </span>
            <span className={s.metaLabel}>Failures</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={s.chartWrap}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#c9a96e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#c9a96e" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono' }}
              tickLine={false}
              axisLine={false}
              interval={labelEvery - 1}
            />

            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}ms`}
              width={52}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Avg reference line */}
            <ReferenceLine
              y={avgVal}
              stroke="rgba(201,169,110,0.3)"
              strokeDasharray="4 4"
              label={{
                value: `avg ${avgVal}ms`,
                fill: 'rgba(201,169,110,0.5)',
                fontSize: 10,
                fontFamily: 'DM Mono',
                position: 'insideTopRight',
              }}
            />

            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#c9a96e"
              strokeWidth={2}
              fill="url(#responseGradient)"
              dot={<CustomDot />}
              activeDot={{
                r: 5,
                fill: '#c9a96e',
                stroke: 'rgba(201,169,110,0.3)',
                strokeWidth: 6,
              }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Down incidents legend */}
      {downCount > 0 && (
        <div className={s.legend}>
          <span className={s.legendDot} style={{ background: '#f87171' }} />
          <span className={s.legendText}>
            {downCount} failed check{downCount > 1 ? 's' : ''} — shown as 0ms on the chart
          </span>
        </div>
      )}

    </div>
  )
}