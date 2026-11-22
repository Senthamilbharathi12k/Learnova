
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Trash2,
} from 'lucide-react'
import './SkillsAssessment.css'
import {
  getAssessmentCategories,
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentHistory,
  deleteAssessmentAttempt,
} from '../../services/assessmentService'

import { updateOnboardingStep } from '../../services/onboardingService'

function SkillsAssessment() {
  const [categories, setCategories] = useState([])
  const [history, setHistory] = useState([])

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  const [result, setResult] = useState(null)
  const [showReview, setShowReview] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Swipe and delete states
  const [swipedHistoryId, setSwipedHistoryId] = useState(null)
  const [deletingHistoryId, setDeletingHistoryId] = useState(null)

  useEffect(() => {
    let active = true

    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError('')

        const [categoryData, historyData] = await Promise.all([
          getAssessmentCategories(),
          getAssessmentHistory(),
        ])

        if (active) {
          setCategories(categoryData)
          setHistory(historyData)
        }
      } catch {
        if (active) {
          setError('Unable to load assessment data. Please refresh the page.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitialData()

    return () => {
      active = false
    }
  }, [])

  const current = questions[currentQuestion]
  const answeredCount = Object.keys(answers).length

  const progress = questions.length
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0

  const startAssessment = async (category) => {
    try {
      setLoading(true)
      setError('')

      const questionData = await getAssessmentQuestions(category.id)

      if (!Array.isArray(questionData) || questionData.length === 0) {
        setError('No questions are available for this assessment.')
        return
      }

      setSelectedCategory(category)
      setQuestions(questionData)
      setCurrentQuestion(0)
      setAnswers({})
      setResult(null)
      setShowReview(false)
    } catch {
      setError('Unable to start the assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (answerIndex) => {
    if (result || submitting || !current) return

    setAnswers((previous) => ({
      ...previous,
      [current.id]: answerIndex,
    }))
  }

  const goToNext = () => {
    if (
      currentQuestion < questions.length - 1 &&
      answers[current?.id] !== undefined
    ) {
      setCurrentQuestion((previous) => previous + 1)
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1)
    }
  }

  const handleSubmit = async () => {
    if (
      answeredCount !== questions.length ||
      submitting ||
      !selectedCategory
    ) {
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Backend calculates and saves the result
      const finalResult = await submitAssessment(
        selectedCategory.id,
        answers
      )

      // Fetch updated backend history
      const updatedHistory = await getAssessmentHistory()

      setResult(finalResult)
      setHistory(updatedHistory)
      setShowReview(false)

      updateOnboardingStep('assessmentCompleted', true)
    } catch (error) {
      console.error('Assessment submission failed:', error)

      setError(
        error.response?.data?.detail ||
        'Unable to submit your assessment. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Delete only the selected assessment result
  const handleDeleteHistory = async (attemptId) => {
    if (deletingHistoryId !== null) return

    try {
      setDeletingHistoryId(attemptId)
      setError('')

      await deleteAssessmentAttempt(attemptId)

      setHistory((previous) =>
        previous.filter((item) => item.id !== attemptId)
      )

      setSwipedHistoryId(null)
    } catch (error) {
      console.error('Assessment result deletion failed:', error)

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Unable to delete assessment result. Please try again.'
      )
    } finally {
      setDeletingHistoryId(null)
    }
  }

  const retakeAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
    setShowReview(false)
    setError('')
  }

  const backToCategories = async () => {
    setSelectedCategory(null)
    setQuestions([])
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
    setShowReview(false)
    setError('')

    try {
      setHistory(await getAssessmentHistory())
    } catch {
      setError('Unable to refresh assessment history.')
    }
  }

  const getLevelDescription = (level) => {
    if (level === 'ADVANCED') {
      return 'Excellent work! You have demonstrated strong knowledge in this subject.'
    }

    if (level === 'INTERMEDIATE') {
      return 'Good progress! You understand the fundamentals and can improve with practice.'
    }

    return 'You are at the beginning of your learning journey. Keep practising and learning.'
  }

  if (loading) {
    return (
      <main className="assessment-page">
        <div className="assessment-loading">
          <BookOpen size={32} />
          <p>Preparing your assessment...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="assessment-page">
      <div className="assessment-container">
        {!selectedCategory && (
          <>
            <motion.header
              className="assessment-header"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="assessment-eyebrow">
                TEST YOUR KNOWLEDGE
              </span>

              <h1>Skills Assessment</h1>

              <p>
                Discover your current skill level through short
                multiple-choice assessments. Choose a topic and get started.
              </p>
            </motion.header>

            {error && (
              <div className="assessment-error" role="alert">
                {error}
              </div>
            )}

            <section className="assessment-info-grid">
              <div className="assessment-info-card">
                <div className="assessment-info-icon">
                  <Target size={22} />
                </div>
                <div>
                  <strong>{categories.length}</strong>
                  <span>Assessment Topics</span>
                </div>
              </div>

              <div className="assessment-info-card">
                <div className="assessment-info-icon">
                  <BookOpen size={22} />
                </div>
                <div>
                  <strong>
                    {categories.length > 0 ? categories[0].questionCount : 0}
                  </strong>
                  <span>Questions per Test</span>
                </div>
              </div>

              <div className="assessment-info-card">
                <div className="assessment-info-icon">
                  <Trophy size={22} />
                </div>
                <div>
                  <strong>{history.length}</strong>
                  <span>Completed Tests</span>
                </div>
              </div>
            </section>

            <div className="assessment-section-heading">
              <div>
                <h2>Choose Your Assessment</h2>
                <p>Select a skill to evaluate your knowledge.</p>
              </div>
            </div>

            <section className="assessment-category-grid">
              {categories.map((category, index) => {
                const latestResult = history.find(
                  (item) => item.categoryId === category.id
                )

                return (
                  <motion.article
                    className="assessment-category-card"
                    key={category.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div className="assessment-category-top">
                      <span className="assessment-category-icon">
                        <BookOpen size={23} />
                      </span>

                      {latestResult && (
                        <span className="assessment-completed-tag">
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      )}
                    </div>

                    <span className="assessment-category-level">
                      {category.level}
                    </span>

                    <h3>{category.name}</h3>
                    <p>{category.description}</p>

                    <div className="assessment-category-meta">
                      <span>
                        <BookOpen size={14} />
                        {category.questionCount} Questions
                      </span>

                      <span>
                        <Clock3 size={14} />
                        {category.duration}
                      </span>
                    </div>

                    {latestResult && (
                      <div className="assessment-last-result">
                        Latest score: <strong>{latestResult.score}%</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      className="assessment-start-button"
                      onClick={() => startAssessment(category)}
                    >
                      {latestResult ? 'Retake Assessment' : 'Start Assessment'}
                      <ArrowRight size={17} />
                    </button>
                  </motion.article>
                )
              })}
            </section>

            {history.length > 0 && (
              <section className="assessment-history">
                <div className="assessment-section-heading">
                  <div>
                    <h2>Recent Assessment Results</h2>
                    <p>Your saved assessment history.</p>
                  </div>
                </div>

                <div className="assessment-history-list">
                  {history.slice(0, 5).map((item) => {
                    const isSwiped = swipedHistoryId === item.id
                    const isDeleting = deletingHistoryId === item.id

                    return (
                      <div
                        className="assessment-history-item"
                        key={item.id}
                      >
                        <button
                          type="button"
                          className="assessment-history-delete"
                          onClick={() => handleDeleteHistory(item.id)}
                          disabled={isDeleting || deletingHistoryId !== null}
                          aria-label={`Delete ${item.categoryName} assessment result`}
                        >
                          {isDeleting ? (
                            <span className="assessment-delete-loading">
                              ...
                            </span>
                          ) : (
                            <Trash2 size={19} />
                          )}
                        </button>

                        <motion.div
                          className="assessment-history-row"
                          drag="x"
                          dragDirectionLock
                          dragConstraints={{ left: -85, right: 0 }}
                          dragElastic={0.05}
                          animate={{ x: isSwiped ? -85 : 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 35,
                          }}
                          onDragEnd={(_, info) => {
                            if (info.offset.x < -35) {
                              setSwipedHistoryId(item.id)
                            } else if (info.offset.x > 25) {
                              setSwipedHistoryId(null)
                            }
                          }}
                          style={{ touchAction: 'pan-y' }}
                        >
                          <div>
                            <strong>{item.categoryName}</strong>
                            <span>
                              {new Date(item.completedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="assessment-history-score">
                            <strong>{item.score}%</strong>
                            <span>{item.level}</span>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {selectedCategory && !result && current && (
          <motion.section
            className="assessment-question-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              className="assessment-back-button"
              onClick={backToCategories}
            >
              <ArrowLeft size={17} />
              Back to assessments
            </button>

            <div className="assessment-test-heading">
              <div>
                <span className="assessment-eyebrow">
                  SKILLS ASSESSMENT
                </span>
                <h1>{selectedCategory.name}</h1>
                <p>Choose the correct answer for each question.</p>
              </div>

              <div className="assessment-question-counter">
                <strong>{currentQuestion + 1}</strong>
                <span> / {questions.length}</span>
              </div>
            </div>

            <div className="assessment-progress-area">
              <div className="assessment-progress-label">
                <span>Assessment Progress</span>
                <strong>{Math.round(progress)}%</strong>
              </div>

              <div className="assessment-progress-track">
                <div
                  className="assessment-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="assessment-question-card">
              <div className="assessment-question-label">
                QUESTION {currentQuestion + 1}
              </div>

              <h2>{current.question}</h2>

              <div className="assessment-options">
                {current.options.map((option, index) => {
                  const selected = answers[current.id] === index

                  return (
                    <button
                      type="button"
                      key={index}
                      className={`assessment-option ${
                        selected ? 'assessment-option-selected' : ''
                      }`}
                      onClick={() => selectAnswer(index)}
                    >
                      <span className="assessment-option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="assessment-option-text">
                        {option}
                      </span>

                      {selected && (
                        <CheckCircle2
                          className="assessment-option-check"
                          size={20}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="assessment-question-footer">
              <button
                type="button"
                className="assessment-previous-button"
                onClick={goToPrevious}
                disabled={currentQuestion === 0 || submitting}
              >
                <ArrowLeft size={17} />
                Previous
              </button>

              <span className="assessment-answered-count">
                {answeredCount} of {questions.length} answered
              </span>

              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  className="assessment-next-button"
                  onClick={goToNext}
                  disabled={
                    answers[current.id] === undefined || submitting
                  }
                >
                  Next
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  className="assessment-submit-button"
                  onClick={handleSubmit}
                  disabled={
                    answeredCount !== questions.length || submitting
                  }
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                  <CheckCircle2 size={17} />
                </button>
              )}
            </div>

            {error && (
              <div className="assessment-error" role="alert">
                {error}
              </div>
            )}

            <div className="assessment-question-navigation">
              {questions.map((question, index) => (
                <button
                  type="button"
                  key={question.id}
                  className={`assessment-question-dot ${
                    currentQuestion === index ? 'active' : ''
                  } ${
                    answers[question.id] !== undefined ? 'answered' : ''
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                  disabled={submitting}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {selectedCategory && result && (
          <motion.section
            className="assessment-result-view"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="assessment-result-icon">
              <Award size={36} />
            </div>

            <span className="assessment-eyebrow">
              ASSESSMENT COMPLETED
            </span>

            <h1>Your Results Are Ready!</h1>

            <p className="assessment-result-description">
              {getLevelDescription(result.level)}
            </p>

            <div className="assessment-score-card">
              <span>YOUR SCORE</span>
              <strong>{result.score}%</strong>
              <div className="assessment-score-track">
                <div
                  className="assessment-score-fill"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="assessment-result-stats">
              <div>
                <CheckCircle2 size={22} />
                <strong>{result.correctAnswers}</strong>
                <span>Correct Answers</span>
              </div>

              <div>
                <XCircle size={22} />
                <strong>
                  {result.totalQuestions - result.correctAnswers}
                </strong>
                <span>Incorrect Answers</span>
              </div>

              <div>
                <Target size={22} />
                <strong>{result.totalQuestions}</strong>
                <span>Total Questions</span>
              </div>
            </div>

            <div className={`assessment-level-result ${result.level.toLowerCase()}`}>
              <Sparkles size={23} />
              <div>
                <span>YOUR CURRENT SKILL LEVEL</span>
                <strong>{result.level}</strong>
              </div>
            </div>

            <button
              type="button"
              className="assessment-review-button"
              onClick={() => setShowReview((previous) => !previous)}
            >
              {showReview ? 'Hide Answer Review' : 'Review Answers'}
            </button>

            {showReview && (
              <div className="assessment-review-list">
                {result.reviewAnswers?.length > 0 ? (
                  result.reviewAnswers.map((item, index) => (
                    <div
                      className="assessment-review-item"
                      key={item.questionId}
                    >
                      <div className="assessment-review-question">
                        <strong>
                          {index + 1}. {item.question}
                        </strong>
                      </div>

                      <p>
                        Your answer:{' '}
                        <strong
                          className={
                            item.isCorrect
                              ? 'assessment-review-correct'
                              : 'assessment-review-incorrect'
                          }
                        >
                          {item.options[item.selectedAnswer] ?? 'Not available'}
                        </strong>
                      </p>

                      <p>
                        Correct answer:{' '}
                        <strong className="assessment-review-correct">
                          {item.options[item.correctAnswer] ?? 'Not available'}
                        </strong>
                      </p>

                      <span
                        className={
                          item.isCorrect
                            ? 'assessment-review-status correct'
                            : 'assessment-review-status incorrect'
                        }
                      >
                        {item.isCorrect
                          ? '✓ Correct Answer'
                          : '✗ Incorrect Answer'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>
                    Answer review is not available for this assessment.
                  </p>
                )}
              </div>
            )}

            <div className="assessment-result-actions">
              <button
                type="button"
                className="assessment-retake-button"
                onClick={retakeAssessment}
              >
                <RotateCcw size={17} />
                Retake Test
              </button>

              <button
                type="button"
                className="assessment-finish-button"
                onClick={backToCategories}
              >
                Back to Assessments
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="assessment-next-step">
              <div>
                <CheckCircle2 size={22} />
                <div>
                  <strong>Assessment step completed!</strong>
                  <p>
                    Your next step is to explore your course recommendations.
                  </p>
                </div>
              </div>

              <Link
                to="/student/recommendations"
                className="assessment-continue-button"
              >
                Continue to Course Recommendations
                <ArrowRight size={17} />
              </Link>
            </div>
          </motion.section>
        )}
      </div>
    </main>
  )
}

export default SkillsAssessment
