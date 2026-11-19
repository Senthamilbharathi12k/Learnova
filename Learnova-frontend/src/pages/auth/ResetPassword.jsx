
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { resetPassword } from '../../services/authService'
import './VerifyOTP.css'

function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      navigate('/forgot-password', { replace: true })
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(email, password, confirmPassword)

      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successful. Please login with your new password.' },
      })
    } catch (err) {
      const data = err.response?.data
      const messages = data && typeof data === 'object'
        ? Object.values(data).flat().filter((item) => typeof item === 'string')
        : []

      setError(
        data?.message ||
        data?.detail ||
        messages.join(' ') ||
        'Password reset failed. Please try again.'
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

        <h2>Reset Password</h2>

        <p className="verify-description">
          Create a new password for your account.
        </p>

        <p className="verify-email">{email}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New Password</label>
          <div className="verify-password-wrapper">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle new password visibility"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <label htmlFor="confirm-password">Confirm New Password</label>
          <div className="verify-password-wrapper">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && <p className="verify-error" role="alert">{error}</p>}

          <button type="submit" className="verify-submit" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>

        <Link to="/login" className="verify-back">
          <ArrowLeft size={17} />
          Back to Login
        </Link>
      </motion.div>
    </div>
  )
}

export default ResetPassword
