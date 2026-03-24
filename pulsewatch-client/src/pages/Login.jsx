import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import s from './Auth.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch(`http://localhost:3000/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid email or password.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify({ name: data.name, id: data.user_id }))
      navigate('/dashboard')
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card} data-aos = "fade-up" data-aos-duration="800">

        <div className={s.cardHeader}>
          <Link to="/" className={s.logo}>PulseWatch</Link>
          <span className={s.headerTag}>Sign In</span>
        </div>

        <div className={s.cardBody}>
          <h1 className={s.title}>Welcome back.</h1>
          <p className={s.subtitle}>Sign in to your monitoring dashboard.</p>

          {error && <div className={`${s.alertBox} ${s.alertError}`}>{error}</div>}

          <form className={s.form} onSubmit={handleSubmit}>
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
                autoFocus
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
              />
            </div>

            <button className={s.submitBtn} type="submit" disabled={loading}>
              {loading && <span className={s.spinner} />}
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className={s.divider} style={{ marginTop: '24px' }}>
            <div className={s.dividerLine} />
            <span className={s.dividerText}>OR</span>
            <div className={s.dividerLine} />
          </div>

          <p className={s.footer} style={{ marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/signup" className={s.footerLink}>Create one free →</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
