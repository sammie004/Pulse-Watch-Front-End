import { Link } from 'react-router-dom'
import s from './Landing.module.css'

const MONITOR_ROWS = [
  { url: 'google.com',    ms: '142ms', up: true  },
  { url: 'myapp.io',      ms: '89ms',  up: true  },
  { url: 'api.mysite.com',ms: '—',     up: false },
  { url: 'staging.io',    ms: '201ms', up: true  },
]

const FEATURES = [
  { icon: '📡', title: 'Real-time Monitoring',  desc: 'HTTP checks every minute across all your URLs. Zero blind spots, zero delays.'       },
  { icon: '⚡', title: 'Instant Alerts',         desc: 'Email notifications the moment a status changes — up, down, or anything in between.' },
  { icon: '📊', title: 'Detailed Analytics',     desc: 'Response times, uptime percentages, and full historical logs at your fingertips.'    },
  { icon: '🔄', title: 'Auto Recovery Alerts',   desc: 'Know the second your service recovers. No more manually checking if it\'s back.'     },
  { icon: '🛡️', title: 'Circuit Breaker',        desc: 'Smart failure detection prevents alert spam when a service is persistently down.'    },
  { icon: '📬', title: 'Digest Emails',          desc: 'Multiple changes batched into one clean digest email per monitoring tick.'            },
]

const STEPS = [
  { n: '01', title: 'Create Account',   desc: 'Sign up in seconds. No credit card required.'        },
  { n: '02', title: 'Add Your URLs',    desc: 'Paste any HTTP or HTTPS URL you want to monitor.'    },
  { n: '03', title: 'We Watch 24/7',    desc: 'PulseWatch checks every minute, automatically.'      },
  { n: '04', title: 'Get Notified',     desc: 'Receive an email the moment something changes.'      },
]

export default function Landing() {
  return (
    <div className={s.page}>

      {/* ── Nav ── */}
      <nav className={s.nav}>
        <span className={s.navLogo}>PulseWatch</span>
        <div className={s.navLinks}>
          <a href="#features" className={s.navLink}>Features</a>
          <a href="#how"      className={s.navLink}>How it works</a>
          <Link to="/login"   className={s.navLink}>Sign in</Link>
          <Link to="/signup"  className={s.navCta}>Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero} data-aos="fade-up">
        <div className={s.heroInner}>

          <div className={s.heroLeft}>
            <div className={s.heroBadge}>
              <span className={s.heroBadgeDot} />
              Live monitoring
            </div>

            <h1 className={s.heroTitle}>
              Know when your<br/>
              sites go <em>down.</em><br/>
              Before anyone else.
            </h1>

            <p className={s.heroSub}>
              PulseWatch monitors your URLs every minute and alerts you instantly
              when something changes — so you can fix it before your users notice.
            </p>

            <div className={s.heroCtas}>
              <Link to="/signup" className={s.btnPrimary}>Start monitoring free →</Link>
              <a href="#features" className={s.btnSecondary}>See how it works</a>
            </div>
          </div>

          {/* Live monitor mockup */}
          <div className={s.heroRight}>
            <div className={s.monitorCard}>
              <div className={s.monitorHeader}>
                <div className={s.monitorDots}>
                  <div className={`${s.dot} ${s.dotRed}`}    />
                  <div className={`${s.dot} ${s.dotYellow}`} />
                  <div className={`${s.dot} ${s.dotGreen}`}  />
                </div>
                <span className={s.monitorTitle}>PULSEWATCH — LIVE</span>
                <span />
              </div>

              <div className={s.monitorBody}>
                {MONITOR_ROWS.map((row, i) => (
                  <div key={i} className={s.monitorRow}>
                    <div className={s.monitorRowLeft}>
                      <div className={`${s.statusDot} ${row.up ? s.statusUp : s.statusDown}`} />
                      <span className={s.monitorUrl}>{row.url}</span>
                    </div>
                    <div className={s.monitorRight}>
                      <span className={s.monitorMs}>{row.ms}</span>
                      <span className={`${s.statusBadge} ${row.up ? s.badgeUp : s.badgeDown}`}>
                        {row.up ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                ))}

                <div className={s.statsBar}>
                  <div className={s.statItem}>
                    <span className={s.statVal}>99.9%</span>
                    <span className={s.statLabel}>Uptime</span>
                  </div>
                  <div className={s.statItem}>
                    <span className={s.statVal}>142ms</span>
                    <span className={s.statLabel}>Avg Response</span>
                  </div>
                  <div className={s.statItem}>
                    <span className={s.statVal}>1 min</span>
                    <span className={s.statLabel}>Check Interval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className={s.features} id="features" data-aos = "zoom-in">
        <div className={s.sectionLabel}>// What you get</div>
        <h2 className={s.sectionTitle}>
          Everything you need<br/>
          to stay <em style={{ fontStyle:'italic', color:'var(--gold)' }}>informed.</em>
        </h2>

        <div className={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={s.featureCard}>
              <div className={s.featureIcon}>{f.icon}</div>
              <div className={s.featureTitle}>{f.title}</div>
              <div className={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={s.howItWorks} id="how" data-aos = "fade-up">
        <div className={s.howInner}>
          <div className={s.sectionLabel}>// How it works</div>
          <h2 className={s.sectionTitle}>Up and running<br/>in minutes.</h2>

          <div className={s.steps}>
            {STEPS.map((step, i) => (
              <div key={i} className={s.step}>
                <div className={s.stepNum} data-aos = "zoom-in">{step.n}</div>
                <div className={s.stepTitle} data-aos = "zoom-in">{step.title}</div>
                <div className={s.stepDesc} data-aos = "fade-up">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={s.ctaBanner}>
        <h2 className={s.ctaBannerTitle}>
          Start watching your<br/>
          <span className={`${s.gold_text}`}
            style={{
              background: 'linear-gradient(135deg, #c9a96e, #e8c98a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            URLs today.
          </span>
        </h2>
        <p className={s.ctaBannerSub}>
          Free to start. No credit card. Just add a URL and we'll start watching immediately.
        </p>
        <Link to="/signup" className={s.btnPrimary}>
          Create your free account →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <span className={s.footerLogo}>PulseWatch</span>
        <span className={s.footerText}>© {new Date().getFullYear()} PULSEWATCH — ALL RIGHTS RESERVED</span>
        <div className={s.footerLinks}>
          <Link to="/login"  className={s.footerLink}>Sign in</Link>
          <Link to="/signup" className={s.footerLink}>Sign up</Link>
        </div>
      </footer>

    </div>
  )
}
