// PulseLoader.jsx
import s from './PulseLoader.module.css'

export default function PulseLoader({ color = '#34d399', width = 300, height = 60 }) {
  return (
    <div className={s.wrap}>
      <svg
        viewBox="0 0 300 60"
        width={width}
        height={height}
        className={s.svg}
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* The ECG path — flatline → spike → flatline */}
        <path
          className={s.path}
          d="M0,30 L60,30 L80,30 L90,30 L95,10 L100,50 L105,5 L112,55 L118,30 L240,30 L300,30"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Moving dot at the tip of the line */}
        <circle className={s.dot} r="3" fill={color} filter="url(#glow)"/>
      </svg>
    </div>
  )
}