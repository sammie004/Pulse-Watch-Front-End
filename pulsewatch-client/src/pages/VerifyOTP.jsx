import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import s from './Auth.module.css'
import vs from './VerifyOTP.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function VerifyOTP() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // signup_token passed via navigate state from Signup page
  const signupToken = location.state?.signup_token || ''
  const userEmail   = location.state?.email || ''

  const [digits,  setDigits]  = useState(['', '', '', '', '', ''])
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent,  setResent]  = useState(false)

  const inputRefs = useRef([])

  // Redirect if no token (arrived directly without signing up)
  useEffect(() => {
    if (!signupToken) navigate('/signup', { replace: true })
  }, [signupToken, navigate])

  const handleDigit = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = val
    setDigits(next)
    setError('')

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto submit when all 6 filled
    if (val && index === 5 && next.every(d => d !== '')) {
      submitOtp(next.join(''))
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0)  inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = e => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    pasted.split('').forEach((char, i) => { if (i < 6) next[i] = char })
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) submitOtp(pasted)
  }

  const submitOtp = async (code) => {
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ otp: code, signup_token: signupToken }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid OTP. Please try again.')
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      setSuccess('Account verified! Redirecting you to sign in...')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    submitOtp(code)
  }

  return (
    <div className={s.page}>
      <div className={`${s.card} ${vs.card}`}>

        <div className={s.cardHeader}>
          <Link to="/" className={s.logo}>PulseWatch</Link>
          <span className={s.headerTag}>Verify Email</span>
        </div>

        <div className={s.cardBody}>

          {/* Icon */}
          <div className={vs.iconWrap}>
            <div className={vs.icon}>✉</div>
            <div className={vs.iconGlow} />
          </div>

          <h1 className={s.title}>Check your inbox.</h1>
          <p className={s.subtitle}>
            We sent a 6-digit code to{' '}
            {userEmail
              ? <strong style={{ color: 'var(--text-1)' }}>{userEmail}</strong>
              : 'your email address'
            }.{' '}
            Enter it below to verify your account.
          </p>

          {error   && <div className={`${s.alertBox} ${s.alertError}`}   style={{ marginBottom: 0 }}>{error}</div>}
          {success && <div className={`${s.alertBox} ${s.alertSuccess}`} style={{ marginBottom: 0 }}>{success}</div>}

          <form className={vs.form} onSubmit={handleSubmit}>

            {/* OTP digit inputs */}
            <div className={vs.digitRow} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  className={`${vs.digitInput} ${error ? vs.digitError : ''} ${d ? vs.digitFilled : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(e, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  autoFocus={i === 0}
                  disabled={loading || !!success}
                />
              ))}
            </div>

            <button
              className={s.submitBtn}
              type="submit"
              disabled={loading || !!success || digits.some(d => d === '')}
            >
              {loading && <span className={s.spinner} />}
              {loading ? 'Verifying...' : 'Verify account →'}
            </button>

          </form>

          {/* Expiry note */}
          <p className={vs.expiryNote}>
            Code expires in <span>10 minutes</span>
          </p>

          <div className={s.divider} style={{ marginTop: '20px' }}>
            <div className={s.dividerLine} />
            <span className={s.dividerText}>WRONG EMAIL?</span>
            <div className={s.dividerLine} />
          </div>

          <p className={s.footer} style={{ marginTop: '16px' }}>
            <Link to="/signup" className={s.footerLink}>← Go back and sign up again</Link>
          </p>

        </div>
      </div>
    </div>
  )
}