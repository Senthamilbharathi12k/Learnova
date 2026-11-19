
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { verifyRegistrationOTP, verifyResetOTP } from '../../services/authService'
import './VerifyOTP.css'

function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email || ''
  const flow = location.state?.flow || 'registration'
  const isResetFlow = flow === 'reset'

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      navigate('/login', { replace: true })
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the valid 6-digit OTP.')
      return
    }

    setLoading(true)

    try {
      if (isResetFlow) {
        await verifyResetOTP(email, otp)

        navigate('/reset-password', {
          state: { email },
          replace: true,
        })
      } else {
        await verifyRegistrationOTP(email, otp)

        navigate('/login', {
          replace: true,
          state: { message: 'Your account has been verified. Please login.' },
        })
      }
    } catch (err) {
      const data = err.response?.data
      const messages = data && typeof data === 'object'
        ? Object.values(data).flat().filter((item) => typeof item === 'string')
        : []

      setError(
        data?.message ||
        data?.detail ||
        messages.join(' ') ||
        'OTP verification failed. Please check the OTP and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-page">
      <motion.div
        className="verify-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="verify-icon">
          <ShieldCheck size={31} />
        </div>

        <h2>Verify OTP</h2>

        <p className="verify-description">
          Enter the 6-digit OTP sent to your registered email.
        </p>

        <p className="verify-email">{email || 'Email address unavailable'}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="verify-otp">One-Time Password</label>
          <input
            id="verify-otp"
            className="verify-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              setError('')
            }}
            required
          />

          {error && <p className="verify-error" role="alert">{error}</p>}

          <button type="submit" className="verify-submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <Link
          to={isResetFlow ? '/forgot-password' : '/register'}
          className="verify-back"
        >
          <ArrowLeft size={17} />
          {isResetFlow ? 'Back to Forgot Password' : 'Back to Registration'}
        </Link>
      </motion.div>
    </div>
  )
}

export default VerifyOTP
