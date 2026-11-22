
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Target,
  PlayCircle,
  RefreshCw,
  Award,
  LoaderCircle,
} from 'lucide-react'

import {
  getLearningProgress,
  updateCourseProgress,
  addLearningSession,
} from '../../services/learningProgressService'

import './LearningProgress.css'

function LearningProgress() {
  const [progress, setProgress] = useState({
    courses: [],
    sessions: [],
  })

  const [lessonValues, setLessonValues] = useState({})
  const [hourValues, setHourValues] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadProgress = useCallback(async () => {
  try {
    const data = await getLearningProgress()

    setProgress(data)

    setLessonValues(
      Object.fromEntries(
        data.courses.map((course) => [
          String(course.id),
          String(course.completedLessons),
        ])
      )
    )

    setError('')
  } catch (err) {
    console.error('Unable to load learning progress:', err)

    setError(
      err.response?.data?.message ||
      'Unable to load learning progress. Please try again.'
    )
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => {
  let isMounted = true

  const fetchInitialProgress = async () => {
    try {
      const data = await getLearningProgress()

      if (!isMounted) return

      setProgress(data)

      setLessonValues(
        Object.fromEntries(
          data.courses.map((course) => [
            String(course.id),
            String(course.completedLessons),
          ])
        )
      )

      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Unable to load learning progress:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load learning progress. Please try again.'
      )
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  fetchInitialProgress()

  return () => {
    isMounted = false
  }
}, [])

  const stats = useMemo(() => {
    const courses = progress.courses || []

    const totalLessons = courses.reduce(
      (sum, course) => sum + Number(course.totalLessons || 0),
      0
    )

    const completedLessons = courses.reduce(
      (sum, course) => sum + Number(course.completedLessons || 0),
      0
    )

    const learningHours = courses.reduce(
      (sum, course) => sum + Number(course.learningHours || 0),
      0
    )

    const completedCourses = courses.filter(
  (course) => course.completionStatus === 'COMPLETED'
).length

    return {
      totalCourses: courses.length,
      completedCourses,
      totalLessons,
      completedLessons,
      learningHours,
      percentage: totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
    }
  }, [progress])

  const handleLessonUpdate = async (course) => {
    const value = Number(lessonValues[String(course.id)])

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > course.totalLessons
    ) {
      setMessage(
        `Enter a lesson count from 0 to ${course.totalLessons}.`
      )
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      await updateCourseProgress(course.id, {
        completedLessons: value,
      })

      await loadProgress()
      setMessage('Course progress updated successfully.')
    } catch (err) {
      console.error('Unable to update course progress:', err)
      setError(
        err.response?.data?.message ||
        'Unable to update course progress.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleAddHours = async (course) => {
    const value = Number(hourValues[String(course.id)])

    if (!Number.isFinite(value) || value <= 0 || value > 24) {
      setMessage('Enter a valid learning time between 0 and 24 hours.')
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      await addLearningSession(course.id, value)

      setHourValues((previous) => ({
        ...previous,
        [String(course.id)]: '',
      }))

      await loadProgress()
      setMessage('Learning hours added successfully.')
    } catch (err) {
      console.error('Unable to add learning hours:', err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to add learning hours.'
      )
    } finally {
      setSaving(false)
    }
  }

  const getPercentage = (course) => {
    if (!course.totalLessons) return 0

    return Math.min(
      100,
      Math.round(
        (course.completedLessons / course.totalLessons) * 100
      )
    )
  }

  const recentSessions = (progress.sessions || []).slice(0, 5)

  return (
    <main className="learning-progress-page">
      <section className="progress-hero">
        <div>
          <span className="progress-eyebrow">YOUR LEARNING JOURNEY</span>
          <h1>Learning Progress</h1>
          <p>
            Track your courses, celebrate milestones, and keep moving forward.
          </p>
        </div>
        <div className="progress-hero-icon">
          <TrendingUp size={42} />
        </div>
      </section>

      {error && (
        <div className="progress-message" role="alert">
          {error}
          <button onClick={() => setError('')} aria-label="Close error">
            ×
          </button>
        </div>
      )}

      <section className="progress-stats-grid">
        <article className="progress-stat-card">
          <span className="progress-stat-icon"><BookOpen /></span>
          <div>
            <p>Saved Courses</p>
            <h2>{stats.totalCourses}</h2>
          </div>
        </article>

        <article className="progress-stat-card">
          <span className="progress-stat-icon"><CheckCircle2 /></span>
          <div>
            <p>Completed Courses</p>
            <h2>{stats.completedCourses}</h2>
          </div>
        </article>

        <article className="progress-stat-card">
          <span className="progress-stat-icon"><Clock3 /></span>
          <div>
            <p>Learning Hours</p>
            <h2>{stats.learningHours.toFixed(1)} <small>hrs</small></h2>
          </div>
        </article>

        <article className="progress-stat-card">
          <span className="progress-stat-icon"><Target /></span>
          <div>
            <p>Overall Progress</p>
            <h2>{stats.percentage}%</h2>
          </div>
        </article>
      </section>

      <section className="overall-progress-card">
        <div className="progress-section-heading">
          <div>
            <span className="progress-eyebrow">YOUR PERFORMANCE</span>
            <h2>Overall Learning Progress</h2>
          </div>
          <strong>{stats.percentage}%</strong>
        </div>

        <div className="overall-progress-track">
          <div
            className="overall-progress-fill"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        <div className="overall-progress-footer">
          <span>{stats.completedLessons} lessons completed</span>
          <span>{stats.totalLessons} total lessons</span>
        </div>
      </section>

      <section className="course-progress-section">
        <div className="progress-section-heading">
          <div>
            <span className="progress-eyebrow">KEEP LEARNING</span>
            <h2>Course-wise Progress</h2>
          </div>

          <button
            className="progress-refresh-btn"
            onClick={loadProgress}
            disabled={loading || saving}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="progress-empty-state">
            <LoaderCircle size={35} />
            <h3>Loading learning progress...</h3>
          </div>
        ) : progress.courses.length === 0 ? (
          <div className="progress-empty-state">
            <BookOpen size={42} />
            <h3>No saved courses yet</h3>
            <p>
              Save a course from Explore Courses to start tracking your
              learning progress.
            </p>
            <a href="/student/courses">Explore Courses</a>
          </div>
        ) : (
          <div className="course-progress-grid">
            {progress.courses.map((course) => {
              const percentage = getPercentage(course)
              const isCompleted = course.completionStatus === 'COMPLETED'

              return (
                <article className="course-progress-card" key={course.id}>
                  <div className="course-progress-top">
                    <span className="course-progress-icon">
                      <BookOpen size={21} />
                    </span>
                    <span
                      className={`course-status ${
                        isCompleted ? 'completed' : ''
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <h3>{course.title}</h3>
                  <p className="course-progress-category">
                    {course.category}
                  </p>

                  <div className="course-progress-percentage">
                    <span>Course completion</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div className="course-progress-track">
                    <div
                      className="course-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="course-lesson-count">
                    {course.completedLessons} of {course.totalLessons} lessons
                    completed
                  </p>

                  <div className="course-progress-editor">
                    <label htmlFor={`lessons-${course.id}`}>
                      Completed lessons
                    </label>
                    <div className="progress-input-row">
                      <input
                        id={`lessons-${course.id}`}
                        type="number"
                        min="0"
                        max={course.totalLessons}
                        value={lessonValues[String(course.id)] ?? ''}
                        onChange={(event) =>
                          setLessonValues((previous) => ({
                            ...previous,
                            [String(course.id)]: event.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleLessonUpdate(course)}
                        disabled={saving}
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  <div className="course-hours-editor">
                    <label htmlFor={`hours-${course.id}`}>
                      Add learning hours
                    </label>
                    <div className="progress-input-row">
                      <input
                        id={`hours-${course.id}`}
                        type="number"
                        min="0.1"
                        max="24"
                        step="0.5"
                        placeholder="e.g. 1.5"
                        value={hourValues[String(course.id)] ?? ''}
                        onChange={(event) =>
                          setHourValues((previous) => ({
                            ...previous,
                            [String(course.id)]: event.target.value,
                          }))
                        }
                      />
                      <button
                        className="hours-add-btn"
                        onClick={() => handleAddHours(course)}
                        disabled={saving}
                      >
                        Add
                      </button>
                    </div>
                    <small>
                      Total: {Number(course.learningHours || 0).toFixed(1)} hours
                    </small>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="learning-history-section">
        <div className="progress-section-heading">
          <div>
            <span className="progress-eyebrow">RECENT ACTIVITY</span>
            <h2>Learning History</h2>
          </div>
        </div>

        {loading ? (
          <div className="history-empty">
            <LoaderCircle size={24} />
            <p>Loading learning history...</p>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="history-empty">
            <PlayCircle size={24} />
            <p>
              Your learning sessions will appear here when you add study hours.
            </p>
          </div>
        ) : (
          <div className="learning-history-list">
            {recentSessions.map((session) => {
              const course = progress.courses.find(
                (item) => String(item.id) === String(session.courseId)
              )

              return (
                <div className="learning-history-item" key={session.id}>
                  <span className="history-icon">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <strong>{course?.title || 'Course'}</strong>
                    <p>{new Date(session.date).toLocaleString()}</p>
                  </div>
                  <span className="history-hours">
                    +{session.hours} hrs
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {message && (
        <div className="progress-message" role="status">
          {message}
          <button
            onClick={() => setMessage('')}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <section className="progress-motivation">
        <Award size={27} />
        <div>
          <h3>Every lesson takes you one step forward!</h3>
          <p>
            Stay consistent, update your progress, and celebrate every
            milestone.
          </p>
        </div>
      </section>
    </main>
  )
}

export default LearningProgress
