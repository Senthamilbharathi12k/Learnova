
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  UserRound,
  Brain,
  BookOpen,
  Compass,
  FileText,
  BriefcaseBusiness,
  ArrowRight,
  GraduationCap,
  Target,
  Sparkles,
} from 'lucide-react'

import { getDashboardSummary } from '../../services/profileService'
import './StudentDashboard.css'

const quickActions = [
  {
    title: 'My Profile',
    description: 'Update your personal and educational details.',
    icon: UserRound,
    link: '/student/profile',
  },
  {
    title: 'Skills & Interests',
    description: 'Add the skills and interests you want to develop.',
    icon: Brain,
    link: '/student/skills',
  },
  {
    title: 'Course Recommendations',
    description: 'Explore courses matched to your skills and interests.',
    icon: Sparkles,
    link: '/student/recommendations',
  },
  {
    title: 'Discover Courses',
    description: 'Find online, offline, free and paid courses.',
    icon: Compass,
    link: '/student/courses',
  },
  {
    title: 'Resume Resources',
    description: 'Explore external tools to create a professional resume.',
    icon: FileText,
    link: '/student/resume-resources',
  },
  {
    title: 'Portfolio Resources',
    description: 'Find platforms and tools to build your portfolio.',
    icon: BriefcaseBusiness,
    link: '/student/portfolio-resources',
  },
]

function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getDashboardSummary()

      setDashboardData(response.dashboard)
    } catch (err) {
      console.error('Dashboard API Error:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load dashboard information. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const profileCompletion =
    dashboardData?.profile_completion ?? 0

  return (
    <main className="student-dashboard">
      <div className="dashboard-container">

        {/* Welcome Section */}
        <motion.section
          className="dashboard-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logout Button */}
          <div className="dashboard-logout-wrapper">
            <Link to="/logout" className="dashboard-logout-btn">
              <LogOut size={18} />
              Logout
            </Link>
          </div>

          <div className="welcome-content">
            <span className="welcome-label">
              <Sparkles size={16} /> YOUR LEARNING SPACE
            </span>

            <h1>
              Welcome to <span>Learnova!</span>
            </h1>

            <p>
              {dashboardData?.student_name
                ? `Welcome back, ${dashboardData.student_name}! `
                : ''}
              Learn new skills, discover the right courses, and take the next
              step towards your future.
            </p>

            <Link
              to="/student/courses"
              className="dashboard-primary-btn"
            >
              Explore Courses <ArrowRight size={18} />
            </Link>
          </div>

          <div className="welcome-illustration">
            <div className="welcome-icon-circle">
              <GraduationCap size={76} strokeWidth={1.4} />
            </div>
            <span className="floating-star star-one">✦</span>
            <span className="floating-star star-two">✧</span>
          </div>
        </motion.section>

        {/* API Error Message */}
        {error && (
          <div className="dashboard-error-message" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={fetchDashboard}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview Cards */}
        <section className="dashboard-overview">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">YOUR PROGRESS</span>
              <h2>Learning Overview</h2>
            </div>
          </div>

          <div className="overview-grid">

            {/* Profile Completion */}
            <motion.div
              className="overview-card"
              whileHover={{ y: -5 }}
            >
              <div className="overview-icon green-icon">
                <UserRound size={23} />
              </div>

              <div>
                <p>Profile Completion</p>
                <h3>
                  {loading ? '...' : `${profileCompletion}%`}
                </h3>
                <span className="overview-note">
                  Keep your profile updated
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${profileCompletion}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </motion.div>

            {/* Skills Added */}
            <motion.div
              className="overview-card"
              whileHover={{ y: -5 }}
            >
              <div className="overview-icon gold-icon">
                <Brain size={23} />
              </div>

              <div>
                <p>Skills Added</p>
                <h3>
                  {loading ? '...' : dashboardData?.skills_count ?? 0}
                </h3>
                <span className="overview-note">
                  {loading
                    ? 'Loading your skills...'
                    : `${dashboardData?.interests_count ?? 0} interests added`}
                </span>
              </div>

              <Link
                to="/student/skills"
                className="overview-link"
              >
                Add Skills <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Recommended Courses */}
            <motion.div
              className="overview-card"
              whileHover={{ y: -5 }}
            >
              <div className="overview-icon teal-icon">
                <BookOpen size={23} />
              </div>

              <div>
                <p>Recommended Courses</p>
                <h3>
                  {loading
                    ? '...'
                    : dashboardData?.recommended_courses_count ?? 0}
                </h3>
                <span className="overview-note">
                  Courses matched to your skills and interests
                </span>
              </div>

              <Link
                to="/student/recommendations"
                className="overview-link"
              >
                View Courses <ArrowRight size={15} />
              </Link>
            </motion.div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-actions">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">GET STARTED</span>
              <h2>Explore Learnova</h2>
              <p>
                Everything you need to move forward in your learning journey.
              </p>
            </div>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon

              return (
                <motion.div
                  key={action.title}
                  className="quick-action-card"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.4,
                  }}
                  whileHover={{ y: -6 }}
                >
                  <div className="quick-action-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{action.title}</h3>
                  <p>{action.description}</p>

                  <Link
                    to={action.link}
                    className="quick-action-link"
                  >
                    Explore <ArrowRight size={16} />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Learning Tips */}
        <motion.section
          className="dashboard-tip"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="tip-icon">
            <Target size={27} />
          </div>

          <div className="tip-content">
            <span>YOUR NEXT STEP</span>
            <h3>Start by completing your profile</h3>
            <p>
              Add your education, skills, and interests to get more relevant
              course recommendations.
            </p>
          </div>

          <Link
            to="/student/profile"
            className="tip-button"
          >
            Complete Profile <ArrowRight size={17} />
          </Link>
        </motion.section>

      </div>
    </main>
  )
}

export default StudentDashboard
