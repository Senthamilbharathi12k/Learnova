
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserRound,
  Brain,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Target,
  Sparkles,
  CalendarDays,
  TrendingUp,
  Compass,
  ClipboardCheck,
  Bookmark,
  Clock3,
  GitCompareArrows,
  BriefcaseBusiness,
  FolderKanban,
  FileText,
  CircleAlert,
} from 'lucide-react'

import { getDashboardSummary } from '../../services/profileService'
import {
  getComparisonCourses,
  subscribeComparisonCourses,
} from '../../services/courseComparisonService'

import StudentSidebar from '../../components/layout/StudentSidebar'
import './StudentDashboard.css'

// Learnova student journey - exact requested order (Modules 2 to 14)
const studentJourney = [
  {
    number: 2,
    title: 'Student Profile',
    description:
      'Manage your personal details, educational information and career goals.',
    icon: UserRound,
    link: '/student/profile',
    linkText: 'Manage Profile',
  },
  {
    number: 3,
    title: 'Skills & Interests',
    description:
      'Add, edit and manage your skills, proficiency levels and interests.',
    icon: Brain,
    link: '/student/skills',
    linkText: 'Manage Skills',
  },
  {
    number: 4,
    title: 'Course Recommendations',
    description:
      'Discover rule-based course recommendations matched to your skills and interests.',
    icon: Sparkles,
    link: '/student/recommendations',
    linkText: 'View Recommendations',
  },
  {
    number: 5,
    title: 'Course Discovery',
    description:
      'Explore online and offline courses with free and paid options.',
    icon: Compass,
    link: '/student/courses',
    linkText: 'Explore Courses',
  },
  {
    number: 6,
    title: 'Course Comparison',
    description:
      'Compare course details, features and available options.',
    icon: GitCompareArrows,
    link: '/student/course-comparison',
    linkText: 'Compare Courses',
  },
  {
    number: 7,
    title: 'Saved Courses',
    description:
      'View and manage courses saved for future learning.',
    icon: Bookmark,
    link: '/student/saved-courses',
    linkText: 'View Saved Courses',
  },
  {
    number: 8,
    title: 'Course Learning',
    description:
      'Explore course learning content, lessons and available learning resources.',
    icon: BookOpen,
    link: '/student/courses',
    linkText: 'Explore Learning',
  },
  {
    number: 9,
    title: 'Final Assessment',
    description:
      'Complete course assessments, view scores, check pass or fail status and retake when eligible.',
    icon: ClipboardCheck,
    link: '/student/courses',
    linkText: 'Choose Course for Assessment',
  },
  {
    number: 10,
    title: 'Learning Planner',
    description:
      'Create your weekly study schedule, manage tasks and track task completion.',
    icon: CalendarDays,
    link: '/student/learning-planner',
    linkText: 'Open Planner',
  },
  {
    number: 11,
    title: 'Learning Progress',
    description:
      'Monitor course progress, learning hours and completed courses.',
    icon: TrendingUp,
    link: '/student/learning-progress',
    linkText: 'View Progress',
  },
  {
    number: 12,
    title: 'Virtual Experience',
    description:
      'Explore programs, enroll, complete tasks and submit your work.',
    icon: BriefcaseBusiness,
    link: '/student/virtual-experience',
    linkText: 'Explore Programs',
  },
  {
    number: 13,
    title: 'Portfolio Resources',
    description:
      'Discover external portfolio websites, builders and professional templates.',
    icon: FolderKanban,
    link: '/student/portfolio-resources',
    linkText: 'Explore Resources',
  },
  {
    number: 14,
    title: 'Resume Resources',
    description:
      'Find resume builders, ATS checkers and professional resume guidance.',
    icon: FileText,
    link: '/student/resume-resources',
    linkText: 'Explore Resources',
  },
]

const fetchDashboardData = async () => {
  const response = await getDashboardSummary()

  if (!response?.dashboard) {
    throw new Error(
      'Dashboard data is missing from the server response.'
    )
  }

  return response.dashboard
}
function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [comparisonCount, setComparisonCount] = useState(
    () => getComparisonCourses().length
  )

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const dashboard = await fetchDashboardData()
      setDashboardData(dashboard)
    } catch (err) {
      console.error('Dashboard API Error:', err)

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load dashboard information. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  let isMounted = true

  const loadInitialDashboard = async () => {
    try {
      const dashboard = await fetchDashboardData()

      if (!isMounted) return

      setDashboardData(dashboard)
      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Dashboard API Error:', err)

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load dashboard information. Please try again.'
      )
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  loadInitialDashboard()

  return () => {
    isMounted = false
  }
}, [])

  // Update comparison count when courses are added or removed.
  useEffect(() => {
    const updateComparisonCount = () => {
      setComparisonCount(getComparisonCourses().length)
    }

    updateComparisonCount()

    const unsubscribe = subscribeComparisonCourses(
      updateComparisonCount
    )

    return unsubscribe
  }, [])

  const profileCompletion = Math.min(
    100,
    Math.max(0, dashboardData?.profile_completion ?? 0)
  )

  const skills = dashboardData?.skills ?? []
  const interests = dashboardData?.interests ?? []
  const latestAssessments = dashboardData?.latest_assessments ?? []

  const planner = dashboardData?.planner ?? {}
  const learningProgress = dashboardData?.learning_progress ?? {}

  const overviewStats = [
    {
      label: 'Assessments Completed',
      value: dashboardData?.total_assessments ?? 0,
      note: 'Total assessment attempts',
      icon: ClipboardCheck,
      iconClass: 'green-icon',
      link: '/student/assessment',
      linkText: 'Take Assessment',
    },
    {
      label: 'Saved Courses',
      value: dashboardData?.saved_courses_count ?? 0,
      note: 'Courses saved for later',
      icon: Bookmark,
      iconClass: 'gold-icon',
      link: '/student/saved-courses',
      linkText: 'View Saved Courses',
    },
    {
      label: 'Pending Tasks',
      value: planner.pending_tasks ?? 0,
      note: `${planner.completed_tasks ?? 0} tasks completed`,
      icon: CalendarDays,
      iconClass: 'teal-icon',
      link: '/student/learning-planner',
      linkText: 'Open Planner',
    },
    {
      label: 'Learning Hours',
      value: learningProgress.learning_hours ?? 0,
      note: 'Total recorded learning hours',
      icon: Clock3,
      iconClass: 'green-icon',
      link: '/student/learning-progress',
      linkText: 'View Progress',
    },
    {
      label: 'Courses In Progress',
      value: learningProgress.in_progress_courses ?? 0,
      note: `${learningProgress.completed_courses ?? 0} courses completed`,
      icon: TrendingUp,
      iconClass: 'gold-icon',
      link: '/student/learning-progress',
      linkText: 'Track Progress',
    },
    {
      label: 'Courses to Compare',
      value: comparisonCount,
      note: 'Saved in this browser',
      icon: GitCompareArrows,
      iconClass: 'teal-icon',
      link: '/student/course-comparison',
      linkText: 'Compare Courses',
    },
  ]

  return (
    <div className="student-dashboard-layout">
      <StudentSidebar />

      <main className="student-dashboard">
        <div className="dashboard-container">

          {/* Welcome Section */}
          <motion.section
            className="dashboard-welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                Learn new skills, discover the right courses, and take the
                next step towards your future.
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

          {/* API Error */}
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

          {/* Student Journey - Modules 2 to 13 */}
          <section className="dashboard-actions">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                YOUR LEARNING PATH
              </span>

              <h2>Learnova Student Journey</h2>

              <p>
                Follow your learning journey step by step, from building
                your profile to preparing for your career.
              </p>
            </div>

            <div className="quick-actions-grid">
              {studentJourney.map((item, index) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.number}
                    className="quick-action-card"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.4,
                    }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="quick-action-icon">
                      <Icon size={24} />
                    </div>

                    <span className="dashboard-module-number">
                      MODULE {item.number}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div className="dashboard-module-links">
                      <Link
                        to={item.link}
                        className="quick-action-link"
                      >
                        {item.linkText}
                        <ArrowRight size={16} />
                      </Link>

                      {item.secondaryLink && (
                        <Link
                          to={item.secondaryLink}
                          className="quick-action-link"
                        >
                          {item.secondaryLinkText}
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Learning Overview */}
          <section className="dashboard-overview">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                YOUR PROGRESS
              </span>

              <h2>Learning Overview</h2>

              <p>
                Check your learning journey at a glance.
              </p>
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

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={profileCompletion}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-fill"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>

                <Link
                  to="/student/profile"
                  className="overview-link"
                >
                  Update Profile <ArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Skills */}
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
                    {loading
                      ? '...'
                      : dashboardData?.skills_count ?? 0}
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
                  Manage Skills <ArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Recommendations */}
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
                    Matched to your skills and interests
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

          {/* Learning Activity */}
          <section className="dashboard-overview dashboard-activity">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                YOUR ACTIVITY
              </span>

              <h2>Learning Activity</h2>

              <p>
                Your assessments, saved courses, planner and learning progress.
              </p>
            </div>

            <div className="overview-grid">
              {overviewStats.map((stat) => {
                const Icon = stat.icon

                return (
                  <motion.div
                    className="overview-card"
                    key={stat.label}
                    whileHover={{ y: -5 }}
                  >
                    <div
                      className={`overview-icon ${stat.iconClass}`}
                    >
                      <Icon size={23} />
                    </div>

                    <div>
                      <p>{stat.label}</p>

                      <h3>
                        {loading ? '...' : stat.value}
                      </h3>

                      <span className="overview-note">
                        {stat.note}
                      </span>
                    </div>

                    <Link
                      to={stat.link}
                      className="overview-link"
                    >
                      {stat.linkText} <ArrowRight size={15} />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Skills and Interests */}
          <section className="dashboard-overview">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                YOUR PROFILE
              </span>

              <h2>My Skills & Interests</h2>

              <p>
                Your selected skills and areas of interest.
              </p>
            </div>

            <div className="dashboard-detail-grid">

              {/* Skills */}
              <div className="dashboard-detail-card">
                <div className="dashboard-detail-heading">
                  <h3>My Skills</h3>

                  <span>
                    {loading ? '...' : skills.length}
                  </span>
                </div>

                {loading ? (
                  <p className="dashboard-empty-text">
                    Loading skills...
                  </p>
                ) : skills.length > 0 ? (
                  <div className="dashboard-chip-list">
                    {skills.map((skill) => (
                      <span
                        className="dashboard-chip"
                        key={skill.id}
                      >
                        {skill.name}
                        <small>{skill.proficiency}</small>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty-text">
                    No skills added yet. Add your skills to get
                    relevant course recommendations.
                  </p>
                )}

                <Link
                  to="/student/skills"
                  className="overview-link"
                >
                  Manage Skills <ArrowRight size={15} />
                </Link>
              </div>

              {/* Interests */}
              <div className="dashboard-detail-card">
                <div className="dashboard-detail-heading">
                  <h3>My Interests</h3>

                  <span>
                    {loading ? '...' : interests.length}
                  </span>
                </div>

                {loading ? (
                  <p className="dashboard-empty-text">
                    Loading interests...
                  </p>
                ) : interests.length > 0 ? (
                  <div className="dashboard-chip-list">
                    {interests.map((interest) => (
                      <span
                        className="dashboard-chip"
                        key={interest.id}
                      >
                        {interest.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty-text">
                    No interests added yet. Choose your interests
                    to improve course matching.
                  </p>
                )}

                <Link
                  to="/student/skills"
                  className="overview-link"
                >
                  Manage Interests <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          {/* Latest Assessments */}
          <section className="dashboard-overview">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                SKILL EVALUATION
              </span>

              <h2>Latest Assessments</h2>

              <p>
                Your latest result in each assessment category.
              </p>
            </div>

            <div className="dashboard-assessment-list">
              {loading ? (
                <p className="dashboard-empty-text">
                  Loading assessment results...
                </p>
              ) : latestAssessments.length > 0 ? (
                latestAssessments.map((assessment) => (
                  <div
                    className="dashboard-assessment-item"
                    key={assessment.id}
                  >
                    <div className="assessment-result-icon">
                      <ClipboardCheck size={22} />
                    </div>

                    <div className="assessment-result-content">
                      <h3>{assessment.category}</h3>

                      <p>
                        {assessment.skill || 'Skill assessment'} ·{' '}
                        {assessment.level}
                      </p>
                    </div>

                    <div className="assessment-result-score">
                      <strong>{assessment.score}%</strong>

                      <span>
                        {assessment.correct_answers}/
                        {assessment.total_questions} correct
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  <CircleAlert size={24} />

                  <p>No assessments completed yet.</p>

                  <Link
                    to="/student/assessment"
                    className="overview-link"
                  >
                    Start an Assessment <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Learning Planner Summary */}
          <section className="dashboard-overview">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                STAY ORGANIZED
              </span>

              <h2>Learning Planner Summary</h2>

              <p>
                Keep track of your learning tasks.
              </p>
            </div>

            <div className="planner-summary-card">
              <div>
                <span>Total Tasks</span>

                <strong>
                  {loading ? '...' : planner.total_tasks ?? 0}
                </strong>
              </div>

              <div>
                <span>Pending</span>

                <strong>
                  {loading ? '...' : planner.pending_tasks ?? 0}
                </strong>
              </div>

              <div>
                <span>Completed</span>

                <strong>
                  {loading ? '...' : planner.completed_tasks ?? 0}
                </strong>
              </div>

              <Link
                to="/student/learning-planner"
                className="overview-link"
              >
                Open Planner <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* Learning Progress Summary */}
          <section className="dashboard-overview">
            <div className="dashboard-section-heading">
              <span className="dashboard-eyebrow">
                KEEP MOVING FORWARD
              </span>

              <h2>Learning Progress Summary</h2>

              <p>
                See how your course learning is progressing.
              </p>
            </div>

            <div className="planner-summary-card">
              <div>
                <span>Started Courses</span>

                <strong>
                  {loading
                    ? '...'
                    : learningProgress.started_courses ?? 0}
                </strong>
              </div>

              <div>
                <span>In Progress</span>

                <strong>
                  {loading
                    ? '...'
                    : learningProgress.in_progress_courses ?? 0}
                </strong>
              </div>

              <div>
                <span>Completed</span>

                <strong>
                  {loading
                    ? '...'
                    : learningProgress.completed_courses ?? 0}
                </strong>
              </div>

              <Link
                to="/student/learning-progress"
                className="overview-link"
              >
                View Progress <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* Next Step */}
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

              <h3>
                {profileCompletion < 100
                  ? 'Complete your profile'
                  : 'Keep building your learning journey'}
              </h3>

              <p>
                {profileCompletion < 100
                  ? 'Add your education, skills, and interests to get more relevant course recommendations.'
                  : 'Continue your courses, complete planner tasks, and track your learning progress.'}
              </p>
            </div>

            <Link
              to={
                profileCompletion < 100
                  ? '/student/profile'
                  : '/student/learning-planner'
              }
              className="tip-button"
            >
              {profileCompletion < 100
                ? 'Complete Profile'
                : 'Open Planner'}

              <ArrowRight size={17} />
            </Link>
          </motion.section>

        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
