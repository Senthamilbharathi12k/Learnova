
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  History,
  LoaderCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import {
  getCourseFinalAssessmentQuestions,
  submitCourseFinalAssessment,
  getCourseFinalAssessmentHistory,
} from '../../services/courseFinalAssessmentService'

import './CourseFinalAssessment.css'

// ==========================================
// HELPERS
// ==========================================

const getErrorMessage = (err) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    'Something went wrong. Please try again.'
  )
}

const formatDate = (value) => {
  if (!value) return 'Date not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date not available'

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ==========================================
// COURSE FINAL ASSESSMENT
// ==========================================

function CourseFinalAssessment() {
  const { courseId } = useParams()

  const [questions, setQuestions] = useState([])
  const [courseName, setCourseName] = useState('')
  const [passPercentage, setPassPercentage] = useState(70)

  const [answers, setAnswers] = useState({})
  const [history, setHistory] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)

  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')
  const [isLocked, setIsLocked] = useState(false)

  const [result, setResult] = useState(null)

  // ========================================
  // LOAD QUESTIONS
  // ========================================

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError('')
    setIsLocked(false)

    try {
      const data = await getCourseFinalAssessmentQuestions(courseId)

      const questionList = Array.isArray(data?.questions)
        ? data.questions
        : []

      setQuestions(questionList)
      setCourseName(data?.course_name || '')
      setPassPercentage(Number(data?.pass_percentage || 70))
      setAnswers({})
      setResult(null)
    } catch (err) {
      console.error('Unable to load final assessment:', err)

      if (err?.response?.status === 403) {
        setIsLocked(true)
        setError(
          'Complete your saved course before attempting the final assessment.'
        )
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }, [courseId])

  // ========================================
  // LOAD ATTEMPT HISTORY
  // ========================================

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError('')

    try {
      const data = await getCourseFinalAssessmentHistory(courseId)

      setHistory(
        Array.isArray(data?.history) ? data.history : []
      )
    } catch (err) {
      console.error('Unable to load assessment history:', err)
      setHistoryError(getErrorMessage(err))
    } finally {
      setHistoryLoading(false)
    }
  }, [courseId])

  // ========================================
  // INITIAL LOAD
  // ========================================

// INITIAL LOAD

useEffect(() => {
  let isMounted = true

  const fetchInitialData = async () => {
    if (!isMounted) return

    await Promise.all([
      loadQuestions(),
      loadHistory(),
    ])
  }

  fetchInitialData()

  return () => {
    isMounted = false
  }
}, [loadQuestions, loadHistory])

  // ========================================
  // ANSWER SELECTION
  // ========================================

  const handleAnswerChange = (questionId, optionIndex) => {
    if (result || submitting) return

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }))
  }

  const answeredCount = Object.keys(answers).length

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every((question) =>
      Object.prototype.hasOwnProperty.call(answers, question.id)
    )

  const progressPercentage = useMemo(() => {
    if (!questions.length) return 0

    return Math.round((answeredCount / questions.length) * 100)
  }, [answeredCount, questions.length])

  // ========================================
  // SUBMIT ASSESSMENT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!allQuestionsAnswered || submitting || result) return

    setSubmitting(true)
    setError('')

    try {
      const response = await submitCourseFinalAssessment(
        courseId,
        answers
      )

      setResult({
        ...(response?.attempt || {}),
        pass_percentage: Number(
          response?.pass_percentage ?? passPercentage
        ),
      })

      await loadHistory()
    } catch (err) {
      console.error('Unable to submit final assessment:', err)
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // ========================================
  // RETAKE ASSESSMENT
  // ========================================

  const handleRetake = async () => {
    setAnswers({})
    setResult(null)
    setError('')

    await loadQuestions()
    await loadHistory()

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <main className="course-final-page">
        <div className="course-final-state">
          <LoaderCircle size={38} className="final-loading-icon" />
          <h2>Loading Final Assessment...</h2>
          <p>Preparing your course questions.</p>
        </div>
      </main>
    )
  }

  // ========================================
  // COURSE COMPLETION LOCK
  // ========================================

  if (isLocked) {
    return (
      <main className="course-final-page">
        <div className="course-final-state course-final-locked">
          <div className="course-final-state-icon">
            <ShieldCheck size={36} />
          </div>

          <h2>Final Assessment Locked</h2>

          <p>{error}</p>

          <p className="course-final-lock-note">
            Go to your Saved Courses and mark the course as completed
            after finishing your learning.
          </p>

          <Link
            to="/student/saved-courses"
            className="course-final-primary-link"
          >
            <ArrowLeft size={17} />
            Go to Saved Courses
          </Link>
        </div>
      </main>
    )
  }

  // ========================================
  // GENERAL ERROR / EMPTY STATE
  // ========================================

  if (error && questions.length === 0) {
    return (
      <main className="course-final-page">
        <div className="course-final-state">
          <AlertCircle size={36} />

          <h2>Unable to Load Assessment</h2>
          <p>{error}</p>

          <button
            type="button"
            className="course-final-primary-button"
            onClick={() => {
              loadQuestions()
              loadHistory()
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </main>
    )
  }

  if (!questions.length) {
    return (
      <main className="course-final-page">
        <div className="course-final-state">
          <AlertCircle size={36} />
          <h2>No Questions Available</h2>
          <p>This course does not have active assessment questions.</p>

          <Link
            to="/student/saved-courses"
            className="course-final-primary-link"
          >
            <ArrowLeft size={17} />
            Back to Saved Courses
          </Link>
        </div>
      </main>
    )
  }

  // ========================================
  // RESULT VALUES
  // ========================================

  const isPassed = result?.result === 'PASS'

  const score = Number(result?.score ?? 0)
  const correctAnswers = Number(result?.correct_answers ?? 0)
  const totalQuestions = Number(
    result?.total_questions ?? questions.length
  )

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="course-final-page">

      {/* HERO */}

      <section className="course-final-hero">
        <div className="course-final-hero-content">
          <span className="course-final-eyebrow">
            <Award size={17} />
            COURSE COMPLETION ASSESSMENT
          </span>

          <h1>
            Final Assessment
            <span>{courseName || `Course #${courseId}`}</span>
          </h1>

          <p>
            Test your understanding of what you have learned.
            Complete all questions and submit your answers.
          </p>

          <div className="course-final-hero-meta">
            <span>
              <Clock size={16} />
              {questions.length} Questions
            </span>

            <span>
              <CheckCircle2 size={16} />
              Pass Mark: {passPercentage}%
            </span>
          </div>
        </div>
      </section>

      <section className="course-final-container">

        {/* RESULT PANEL */}

        {result && (
          <motion.section
            className={`course-final-result ${
              isPassed ? 'result-passed' : 'result-failed'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="course-final-result-icon">
              {isPassed ? (
                <CheckCircle2 size={42} />
              ) : (
                <XCircle size={42} />
              )}
            </div>

            <span className="course-final-result-label">
              ASSESSMENT RESULT
            </span>

            <h2>
              {isPassed ? 'Congratulations! You Passed.' : 'Keep Learning. Try Again!'}
            </h2>

            <div className="course-final-score">
              {score}%
            </div>

            <p>
              You answered {correctAnswers} out of {totalQuestions}{' '}
              questions correctly.
            </p>

            <div className="course-final-result-details">
              <span>
                Required Pass Mark: <strong>{passPercentage}%</strong>
              </span>

              <span>
                Your Result:{' '}
                <strong>{isPassed ? 'PASS' : 'FAIL'}</strong>
              </span>
            </div>

            {isPassed && (
              <p className="course-final-pass-message">
                You have successfully passed this course final assessment.
              </p>
            )}

            <button
              type="button"
              className="course-final-primary-button"
              onClick={handleRetake}
            >
              <RefreshCw size={17} />
              Retake Assessment
            </button>
          </motion.section>
        )}

        {/* ASSESSMENT HEADER */}

        {!result && (
          <>
            <div className="course-final-instructions">
              <div>
                <span className="course-final-section-label">
                  YOUR KNOWLEDGE CHECK
                </span>

                <h2>Answer All Questions</h2>

                <p>
                  Select one answer for each question. Your result will
                  be calculated after submission.
                </p>
              </div>

              <div className="course-final-pass-badge">
                <Award size={19} />
                {passPercentage}% to Pass
              </div>
            </div>

            {/* PROGRESS */}

            <div className="course-final-progress">
              <div className="course-final-progress-heading">
                <span>Assessment Progress</span>
                <strong>
                  {answeredCount}/{questions.length} Answered
                </strong>
              </div>

              <div className="course-final-progress-track">
                <div
                  className="course-final-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* QUESTIONS */}

            <form onSubmit={handleSubmit}>
              <div className="course-final-question-list">

                {questions.map((question, index) => (
                  <motion.article
                    className="course-final-question-card"
                    key={question.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.035, 0.2),
                    }}
                  >
                    <div className="course-final-question-heading">
                      <span className="course-final-question-number">
                        QUESTION {index + 1}
                      </span>

                      <span className="course-final-question-count">
                        {index + 1} / {questions.length}
                      </span>
                    </div>

                    <h3>{question.question}</h3>

                    <div className="course-final-options">
                      {question.options.map((option, optionIndex) => {
                        const selected =
                          answers[question.id] === optionIndex

                        return (
                          <label
                            className={`course-final-option ${
                              selected ? 'option-selected' : ''
                            }`}
                            key={optionIndex}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={optionIndex}
                              checked={selected}
                              onChange={() =>
                                handleAnswerChange(
                                  question.id,
                                  optionIndex
                                )
                              }
                            />

                            <span className="course-final-option-marker">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>

                            <span className="course-final-option-text">
                              {option}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </motion.article>
                ))}

              </div>

              {/* SUBMIT ERROR */}

              {error && (
                <div className="course-final-inline-error" role="alert">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {/* SUBMIT */}

              <div className="course-final-submit-area">
                <p>
                  {allQuestionsAnswered
                    ? 'All questions answered. You can submit your assessment.'
                    : `Please answer ${questions.length - answeredCount} more question(s) before submitting.`}
                </p>

                <button
                  type="submit"
                  className="course-final-primary-button"
                  disabled={!allQuestionsAnswered || submitting}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="final-loading-icon"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Assessment
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ATTEMPT HISTORY */}

        <section className="course-final-history">
          <div className="course-final-history-heading">
            <div>
              <span className="course-final-section-label">
                YOUR PREVIOUS ATTEMPTS
              </span>

              <h2>
                <History size={22} />
                Assessment History
              </h2>
            </div>
          </div>

          {historyLoading ? (
            <p className="course-final-history-message">
              <LoaderCircle size={17} className="final-loading-icon" />
              Loading attempt history...
            </p>
          ) : historyError ? (
            <p className="course-final-history-error">
              {historyError}
            </p>
          ) : history.length === 0 ? (
            <p className="course-final-history-message">
              No previous attempts. Your first attempt will appear here.
            </p>
          ) : (
            <div className="course-final-history-list">
              {history.map((attempt, index) => (
                <div
                  className="course-final-history-item"
                  key={attempt.id || `${attempt.completed_at}-${index}`}
                >
                  <div className="course-final-history-number">
                    Attempt {history.length - index}
                  </div>

                  <div className="course-final-history-info">
                    <strong>
                      {Number(attempt.score ?? 0)}% Score
                    </strong>

                    <span>
                      {Number(attempt.correct_answers ?? 0)} /{' '}
                      {Number(attempt.total_questions ?? 0)} Correct
                    </span>

                    <span>
                      {formatDate(attempt.completed_at)}
                    </span>
                  </div>

                  <span
                    className={`course-final-history-result ${
                      attempt.result === 'PASS'
                        ? 'history-pass'
                        : 'history-fail'
                    }`}
                  >
                    {attempt.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BACK LINK */}

        <div className="course-final-back">
          <Link to="/student/saved-courses">
            <ArrowLeft size={16} />
            Back to Saved Courses
          </Link>
        </div>

      </section>
    </main>
  )
}

export default CourseFinalAssessment
