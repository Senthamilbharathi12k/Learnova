
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { logoutStudent, clearAuthSession } from '../../services/authService'
import './Logout.css'

function Logout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    if (loading) return

    setLoading(true)
    setError('')

    const refreshToken =
      sessionStorage.getItem('refreshToken') ||
      localStorage.getItem('refreshToken')

    try {
      if (refreshToken) {
        await logoutStudent(refreshToken)
      }

      clearAuthSession()

      navigate('/login', {
        replace: true,
        state: {
          message: 'You have successfully logged out.'
        }
      })
    } catch {
      // Clear local session even if backend logout fails.
      clearAuthSession()

      navigate('/login', {
        replace: true,
        state: {
          message: 'You have been logged out from this browser.',
          warning: 'Server token revocation could not be confirmed. Please try logging in again.'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="logout-page">
      <motion.section
        className="logout-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Link to="/" className="logout-brand">
          <span><GraduationCap size={25} /></span>
          Learn<span>ova</span>
        </Link>

        <div className="logout-icon">
          <LogOut size={35} />
        </div>

        <h1>Ready to Leave?</h1>

        <p>
          Are you sure you want to log out of your Learnova student account?
          You can sign in again anytime and continue your learning journey.
        </p>

        <div className="logout-security">
          <ShieldCheck size={19} />
          <span>Your session will be securely cleared from this browser.</span>
        </div>

        {error && (
          <p className="logout-error" role="alert">
            {error}
          </p>
        )}

        <div className="logout-actions">
          <button
            type="button"
            className="logout-confirm-btn"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut size={18} />
            {loading ? 'Logging Out...' : 'Yes, Logout'}
          </button>

          <button
            type="button"
            className="logout-cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <ArrowLeft size={18} /> Cancel
          </button>
        </div>

        <Link to="/" className="logout-home-link">
          Back to Home
        </Link>
      </motion.section>
    </main>
  )
}

export default Logout
