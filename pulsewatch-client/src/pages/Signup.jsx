import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import s from './Auth.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Signup() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch(`${API}/api/auth/onboard`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      // Pass signup_token and email to OTP page via navigation state
      navigate('/verify-otp', {
        state: {
          signup_token: data.signup_token,
          email:        form.email,
        }
      })
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card} data-aos = "fade-up" data-aos-duration="800">

        <div className={s.cardHeader}>
          <Link to="/" className={s.logo}>PulseWatch</Link>
          <span className={s.headerTag}>Create Account</span>
        </div>

        <div className={s.cardBody}>
          <h1 className={s.title}>Start monitoring.</h1>
          <p className={s.subtitle}>Free forever. No credit card required.</p>

          {error && <div className={`${s.alertBox} ${s.alertError}`}>{error}</div>}

          <form className={s.form} onSubmit={handleSubmit}>
            <div className={s.field}>
              <label className={s.label}>Full Name</label>
              <input
                className={s.input}
                type="text"
                name="name"
                placeholder="Samuel Ndih"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input
                className={s.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label}>Password</label>
              <input
                className={s.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button className={s.submitBtn} type="submit" disabled={loading}>
              {loading && <span className={s.spinner} />}
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <div className={s.divider} style={{ marginTop: '24px' }}>
            <div className={s.dividerLine} />
            <span className={s.dividerText}>OR</span>
            <div className={s.dividerLine} />
          </div>

          <p className={s.footer} style={{ marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" className={s.footerLink}>Sign in →</Link>
          </p>
        </div>

      </div>
    </div>
  )
}