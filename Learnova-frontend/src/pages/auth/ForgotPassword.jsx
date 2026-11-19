
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, LockKeyhole } from 'lucide-react'
import { motion } from 'framer-motion'
import { forgotPassword } from '../../services/authService'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Please enter your registered email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      await forgotPassword(normalizedEmail)

      navigate('/verify-otp', {
        state: {
          email: normalizedEmail,
          flow: 'reset',
        },
      })
    } catch (err) {
      const data = err.response?.data

      const messages = data && typeof data === 'object'
        ? Object.values(data)
            .flat()
            .filter((item) => typeof item === 'string')
        : []

      setError(
        data?.message ||
        data?.detail ||
        messages.join(' ') ||
        'Unable to send OTP. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-page">
      <motion.div
        className="forgot-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="forgot-icon">
          <LockKeyhole size={30} />
        </div>

        <h2>Forgot Password?</h2>

        <p className="forgot-description">
          Don't worry! Enter your registered email address.
          We'll help you reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">Email Address</label>

          <div className="forgot-input-wrapper">
            <Mail size={19} />

            <input
              id="forgot-email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p className="forgot-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="forgot-submit"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <Link to="/login" className="forgot-back">
          <ArrowLeft size={17} />
          Back to Login
        </Link>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
