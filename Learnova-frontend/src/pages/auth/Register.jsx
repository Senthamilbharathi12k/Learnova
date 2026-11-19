
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { registerStudent } from '../../services/authService'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    })
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const fullName = formData.full_name.trim()
    const email = formData.email.trim().toLowerCase()

    if (fullName.length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please check again.')
      return
    }

    setLoading(true)

    try {
      await registerStudent({
        full_name: fullName,
        email,
        password: formData.password,
        confirm_password: formData.confirm_password
      })

      navigate('/verify-otp', {
        state: {
          email,
          flow: 'registration'
        }
      })
    } catch (err) {
      const responseData = err.response?.data

      let errorMessage =
        responseData?.message ||
        responseData?.detail ||
        'Registration failed. Please try again.'

      if (responseData && typeof responseData === 'object') {
        const fieldErrors = Object.entries(responseData)
          .filter(([key]) => !['message', 'detail'].includes(key))
          .flatMap(([field, messages]) => {
            const readableField = field.replaceAll('_', ' ')

            const messageList = Array.isArray(messages)
              ? messages
              : [messages]

            return messageList.map((message) => {
              if (typeof message === 'string') {
                return `${readableField}: ${message}`
              }
              return `${readableField}: Invalid value`
            })
          })

        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join(' ')
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page register-page">
      <div className="auth-container register-container">
        <motion.section
          className="auth-welcome-panel register-welcome"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon"><GraduationCap size={28} /></span>
            <span>Learn<span>ova</span></span>
          </Link>

          <div className="auth-welcome-content">
            <span className="auth-kicker">BEGIN YOUR JOURNEY</span>
            <h1>Every Great Future Starts with Learning.</h1>
            <p>
              Create your student account and discover learning opportunities
              that help you move forward.
            </p>
            <div className="auth-decoration">
              <GraduationCap size={105} strokeWidth={1.1} />
            </div>
          </div>

          <p className="auth-panel-footer">Learn Skills. Discover Courses. Build Your Future.</p>
        </motion.section>

        <motion.section
          className="auth-form-panel register-form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="auth-form-heading">
            <span className="auth-mobile-brand">LEARNOVA</span>
            <h2>Create Account</h2>
            <p>Register as a student to get started.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full Name</label>
            <div className="auth-input-wrap">
              <User size={19} />
              <input
                id="register-name"
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                autoComplete="name"
                required
                minLength={2}
              />
            </div>

            <label htmlFor="register-email">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={19} />
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <Lock size={19} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label htmlFor="register-confirm-password">Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={19} />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Re-enter your password"
                value={formData.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && <p className="register-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Student Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <Link to="/" className="auth-back-home">← Back to Home</Link>
        </motion.section>
      </div>
    </main>
  )
}

export default Register
