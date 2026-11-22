
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  Bookmark,
  BookmarkX,
  BookOpen,
  Clock,
  ExternalLink,
  GraduationCap,
  Monitor,
  MapPin,
  IndianRupee,
  ArrowRight,
  Trash2,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Award,
  X,
} from 'lucide-react'

import {
  getSavedCourses,
  removeSavedCourse,
  subscribeSavedCourses,
} from '../../services/savedCourseService'

import { getLearningProgress } from '../../services/learningProgressService'

import {
  markCourseCompleted,
} from '../../services/courseFinalAssessmentService'

import './SavedCourses.css'

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatLevel = (value) => {
  if (!value) return 'Not specified'

  const text = String(value).toLowerCase()

  return text.charAt(0).toUpperCase() + text.slice(1)
}

const formatDuration = (weeks) => {
  const duration = Number(weeks)

  if (!Number.isFinite(duration) || duration <= 0) {
    return 'Not specified'
  }

  return duration === 1 ? '1 Week' : `${duration} Weeks`
}

const getCourseResources = (course) => {
  if (Array.isArray(course?.resources)) {
    return course.resources
  }

  if (Array.isArray(course?.filtered_resources)) {
    return course.filtered_resources
  }

  return []
}

const formatPrice = (resource) => {
  if (
    resource?.price === null ||
    resource?.price === undefined ||
    resource?.price === ''
  ) {
    return 'Price varies'
  }

  const currency = resource.currency || 'INR'

  return currency.toUpperCase() === 'INR'
    ? `₹${resource.price}`
    : `${currency} ${resource.price}`
}

const formatCompletedDate = (dateValue) => {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
const fetchSavedCourseData = async () => {
  const [courses, progressData] = await Promise.all([
    getSavedCourses(),
    getLearningProgress(),
  ])

  const progressMap = new Map(
    (progressData?.courses || []).map((item) => [
      String(item.id),
      item,
    ])
  )

  return courses.map((course) => {
    const progress = progressMap.get(String(course.id))

    return {
      ...course,
      completionStatus:
        progress?.completionStatus || 'IN_PROGRESS',
      completedAt: progress?.completedAt || null,
    }
  })
}
// ==========================================
// SAVED COURSES COMPONENT
// ==========================================

function SavedCourses() {
  const [savedCourses, setSavedCourses] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [completingId, setCompletingId] = useState(null)
  const [completionError, setCompletionError] = useState('')

  // ========================================
  // LOAD SAVED COURSES + LEARNING PROGRESS
  // ========================================

  const loadSavedCourses = useCallback(async () => {
  setLoading(true)
  setError('')

  try {
    const mergedCourses = await fetchSavedCourseData()
    setSavedCourses(mergedCourses)
  } catch (err) {
    console.error('Unable to load saved courses:', err)

    setError(
      err?.response?.data?.message ||
      err?.response?.data?.detail ||
      'Unable to load saved courses. Please try again.'
    )
  } finally {
    setLoading(false)
  }
}, [])
  // ========================================
  // INITIAL LOAD AND SYNC
  // ========================================

useEffect(() => {
  let isMounted = true

  const fetchInitialSavedCourses = async () => {
    try {
      const mergedCourses = await fetchSavedCourseData()

      if (!isMounted) return

      setSavedCourses(mergedCourses)
      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Unable to load saved courses:', err)

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Unable to load saved courses. Please try again.'
      )
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  fetchInitialSavedCourses()

  const unsubscribe = subscribeSavedCourses(loadSavedCourses)

  return () => {
    isMounted = false
    unsubscribe()
  }
}, [loadSavedCourses])

  // ========================================
  // REMOVE SAVED COURSE
  // ========================================

  const handleRemove = async (courseId) => {
    if (removingId !== null || completingId !== null) return

    setRemovingId(courseId)
    setError('')

    try {
      await removeSavedCourse(courseId)

      setSavedCourses((previous) =>
        previous.filter(
          (course) => String(course.id) !== String(courseId)
        )
      )
    } catch (err) {
      console.error('Unable to remove saved course:', err)

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Unable to remove this course. Please try again.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  // ========================================
  // OPEN COMPLETION CONFIRMATION
  // ========================================

  const openCompletionConfirmation = (course) => {
    setCompletionError('')
    setSelectedCourse(course)
  }

  const closeCompletionConfirmation = () => {
    if (completingId !== null) return

    setSelectedCourse(null)
    setCompletionError('')
  }

  // ========================================
  // CONFIRM COURSE COMPLETION
  // ========================================

  const handleConfirmCompletion = async () => {
    if (!selectedCourse || completingId !== null) return

    const courseId = selectedCourse.id

    setCompletingId(courseId)
    setCompletionError('')

    try {
      const response = await markCourseCompleted(courseId)

      setSavedCourses((previous) =>
        previous.map((course) =>
          String(course.id) === String(courseId)
            ? {
                ...course,
                completionStatus:
                  response.completion_status || 'COMPLETED',
                completedAt: response.completed_at || null,
              }
            : course
        )
      )

      setSelectedCourse(null)
    } catch (err) {
      console.error('Unable to mark course as completed:', err)

      setCompletionError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Unable to update course completion. Please try again.'
      )
    } finally {
      setCompletingId(null)
    }
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="saved-courses-page">

      {/* HERO SECTION */}

      <section className="saved-courses-hero">
        <motion.div
          className="saved-courses-hero-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="saved-courses-eyebrow">
            <Bookmark size={17} />
            YOUR PERSONAL COURSE LIBRARY
          </span>

          <h1>
            Your Saved Courses.
            <span>Learn at Your Pace.</span>
          </h1>

          <p>
            Keep your favourite courses in one place.
            Revisit them whenever you are ready to learn.
          </p>
        </motion.div>
      </section>

      <section className="saved-courses-container">

        {/* HEADING */}

        <div className="saved-courses-heading">
          <div>
            <span className="saved-courses-label">
              BOOKMARKED LEARNING
            </span>

            <h2>My Saved Courses</h2>

            <p>
              {savedCourses.length}{' '}
              {savedCourses.length === 1 ? 'course' : 'courses'} saved
              in your library.
            </p>
          </div>

          <Link
            to="/student/courses"
            className="saved-browse-button"
          >
            <BookOpen size={17} />
            Explore Courses
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="saved-courses-empty" role="alert">
            <AlertCircle size={32} />

            <h3>Something Went Wrong</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadSavedCourses}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {!error && loading && (
          <div className="saved-courses-empty">
            <LoaderCircle size={36} className="course-loading-icon" />

            <h3>Loading Saved Courses...</h3>

            <p>
              Fetching your saved courses from Learnova.
            </p>
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && !loading && savedCourses.length === 0 && (
          <div className="saved-courses-empty">
            <div className="saved-empty-icon">
              <BookmarkX size={38} />
            </div>

            <h3>No Saved Courses Yet</h3>

            <p>
              You have not bookmarked any courses.
              Explore the course library and save courses
              that interest you.
            </p>

            <Link
              to="/student/courses"
              className="saved-empty-button"
            >
              Explore Courses
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* SAVED COURSE LIST */}

        {!error && !loading && savedCourses.length > 0 && (
          <div className="saved-courses-grid">

            {savedCourses.map((course, index) => {
              const resources = getCourseResources(course)

              const learningMode = String(
                course.learning_mode || ''
              ).toUpperCase()

              const isCompleted =
                course.completionStatus === 'COMPLETED'

              return (
                <motion.article
                  className="saved-course-card"
                  key={course.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.05, 0.2),
                  }}
                >

                  {/* COURSE TOP */}

                  <div className="saved-course-top">
                    <span className="saved-course-category">
                      {course.category || 'General'}
                    </span>

                    <span className="saved-course-bookmark">
                      <Bookmark size={15} fill="currentColor" />
                      Saved
                    </span>
                  </div>

                  <div className="saved-course-icon">
                    <BookOpen size={25} />
                  </div>

                  <h3>{course.name || 'Untitled Course'}</h3>

                  <p className="saved-course-description">
                    {course.description ||
                      'Course description is not available.'}
                  </p>

                  {/* COURSE INFORMATION */}

                  <div className="saved-course-info">
                    <span>
                      {learningMode === 'ONLINE' ? (
                        <Monitor size={15} />
                      ) : (
                        <MapPin size={15} />
                      )}

                      {learningMode
                        ? formatLevel(learningMode)
                        : 'Mode not specified'}
                    </span>

                    <span>
                      <Clock size={15} />
                      {formatDuration(course.duration_weeks)}
                    </span>
                  </div>

                  <div className="saved-course-level">
                    <GraduationCap size={16} />
                    Level: {formatLevel(course.difficulty_level)}
                  </div>

                  {/* COURSE COMPLETION AND FINAL ASSESSMENT */}

                  <div className="saved-course-completion">

                    {isCompleted ? (
                      <>
                        <div className="saved-completion-status">
                          <CheckCircle2 size={19} />

                          <div>
                            <strong>Course Completed</strong>

                            {course.completedAt && (
                              <span>
                                Completed on{' '}
                                {formatCompletedDate(course.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/student/courses/${course.id}/final-assessment`}
                          className="saved-final-assessment-button"
                        >
                          <Award size={17} />
                          Take Final Assessment
                          <ArrowRight size={16} />
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="saved-incomplete-status">
                          <Clock size={18} />

                          <div>
                            <strong>Course In Progress</strong>
                            <span>
                              Complete your learning before taking
                              the final assessment.
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="saved-completion-button"
                          onClick={() =>
                            openCompletionConfirmation(course)
                          }
                          disabled={
                            completingId !== null ||
                            removingId !== null
                          }
                        >
                          <CheckCircle2 size={17} />
                          Mark as Completed
                        </button>
                      </>
                    )}

                  </div>

                  {/* LEARNING RESOURCES */}

                  <div className="saved-course-resources">
                    <h4>
                      <BookOpen size={16} />
                      Learning Resources ({resources.length})
                    </h4>

                    {resources.length > 0 ? (
                      resources.map((resource, resourceIndex) => {
                        const pricingType = String(
                          resource.pricing_type || ''
                        ).toUpperCase()

                        const isFree = pricingType === 'FREE'

                        return (
                          <div
                            className="saved-resource-item"
                            key={
                              resource.id ||
                              `${resource.title}-${resourceIndex}`
                            }
                          >
                            <div>
                              <strong>
                                {resource.title || 'Learning Resource'}
                              </strong>

                              <span
                                className={
                                  isFree
                                    ? 'saved-resource-free'
                                    : 'saved-resource-paid'
                                }
                              >
                                {isFree
                                  ? 'FREE'
                                  : pricingType === 'PAID'
                                    ? 'PAID'
                                    : 'NOT SPECIFIED'}
                              </span>
                            </div>

                            <p>
                              {resource.provider || 'Provider not specified'}
                            </p>

                            <span className="saved-resource-price">
                              {isFree ? (
                                'Free Access'
                              ) : (
                                <>
                                  <IndianRupee size={13} />
                                  {formatPrice(resource)}
                                </>
                              )}
                            </span>

                            {resource.external_url && (
                              <a
                                href={resource.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="saved-resource-link"
                              >
                                Open Resource
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="saved-no-resources">
                        No learning resources available yet.
                      </p>
                    )}
                  </div>

                  {/* REMOVE COURSE */}

                  <button
                    type="button"
                    className="saved-remove-button"
                    onClick={() => handleRemove(course.id)}
                    disabled={
                      removingId !== null ||
                      completingId !== null
                    }
                  >
                    {removingId === course.id ? (
                      <LoaderCircle size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    {removingId === course.id
                      ? 'Removing...'
                      : 'Remove from Saved'}
                  </button>

                </motion.article>
              )
            })}

          </div>
        )}

      </section>

      {/* COURSE COMPLETION CONFIRMATION MODAL */}

      {selectedCourse && (
        <div
          className="saved-completion-modal-overlay"
          role="presentation"
          onClick={closeCompletionConfirmation}
        >
          <motion.div
            className="saved-completion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-completion-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="saved-completion-modal-close"
              onClick={closeCompletionConfirmation}
              disabled={completingId !== null}
              aria-label="Close confirmation"
            >
              <X size={20} />
            </button>

            <div className="saved-completion-modal-icon">
              <GraduationCap size={30} />
            </div>

            <h3 id="saved-completion-modal-title">
              Confirm Course Completion
            </h3>

            <p>
              Have you completed{' '}
              <strong>
                {selectedCourse.name || 'this course'}
              </strong>
              ?
            </p>

            <p className="saved-completion-modal-note">
              Please confirm only after completing your learning.
              Once confirmed, your Course Final Assessment will be
              unlocked.
            </p>

            {completionError && (
              <div className="saved-completion-modal-error" role="alert">
                <AlertCircle size={16} />
                {completionError}
              </div>
            )}

            <div className="saved-completion-modal-actions">
              <button
                type="button"
                className="saved-completion-cancel"
                onClick={closeCompletionConfirmation}
                disabled={completingId !== null}
              >
                Not Yet
              </button>

              <button
                type="button"
                className="saved-completion-confirm"
                onClick={handleConfirmCompletion}
                disabled={completingId !== null}
              >
                {completingId !== null ? (
                  <>
                    <LoaderCircle size={16} className="completion-spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Yes, Completed
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </main>
  )
}

export default SavedCourses
