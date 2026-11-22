
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  loginStudent,
  saveAuthSession,
} from '../../services/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginStudent(email.trim(), password)

      if (!data?.tokens?.access || !data?.tokens?.refresh) {
        throw new Error(
          'Login response is incomplete. Please contact support.'
        )
      }

      // Save access token, refresh token and user details.
      saveAuthSession(data)

      navigate('/student/dashboard', { replace: true })
    } catch (err) {
     const responseData = err.response?.data

      const errorMessage =
        responseData?.message ||
        responseData?.detail ||
        responseData?.email?.[0] ||
        responseData?.password?.[0] ||
        responseData?.non_field_errors?.[0] ||
        err.message ||
        'Login failed. Please try again.'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">

        {/* Welcome Panel */}
        <motion.section
          className="auth-welcome-panel"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">
              <GraduationCap size={28} />
            </span>

            <span>
              Learn<span>ova</span>
            </span>
          </Link>

          <div className="auth-welcome-content">
            <span className="auth-kicker">
              WELCOME BACK
            </span>

            <h1>
              Your Learning Journey Continues Here.
            </h1>

            <p>
              Sign in to discover courses, explore learning opportunities
              and continue building your future.
            </p>

            <div className="auth-decoration">
              <GraduationCap size={105} strokeWidth={1.1} />
            </div>
          </div>

          <p className="auth-panel-footer">
            Learn Skills. Discover Courses. Build Your Future.
          </p>
        </motion.section>

        {/* Login Form Panel */}
        <motion.section
          className="auth-form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="auth-form-heading">
            <span className="auth-mobile-brand">
              LEARNOVA
            </span>

            <h2>Student Login</h2>

            <p>
              Enter your details to access your account.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="auth-input-wrap">
              <Mail size={19} />

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="auth-label-row">
              <label htmlFor="login-password">
                Password
              </label>
            </div>

            <div className="auth-input-wrap">
              <Lock size={19} />

              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                minLength={8}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="forgot-password-link">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Learnova'}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/register">
              Create Account
            </Link>
          </p>

          <Link to="/" className="auth-back-home">
            ← Back to Home
          </Link>
        </motion.section>

      </div>
    </main>
  )
}

export default Login
