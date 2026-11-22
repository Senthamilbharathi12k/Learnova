
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BriefcaseBusiness,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Trash2,
} from 'lucide-react'

import {
  getExperiencePrograms,
  getExperienceProgram,
  getMyExperienceEnrollments,
  getExperienceEnrollment,
  enrollInExperience,
  getExperienceSubmissions,
  submitExperienceTask,
  deleteExperienceEnrollment,
} from '../../services/virtualExperienceService'

import './VirtualExperience.css'

const getErrorMessage = (error) => {
  const data = error.response?.data

  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (data?.message) return data.message

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]

    if (Array.isArray(firstValue)) return firstValue[0]
    if (typeof firstValue === 'string') return firstValue
  }

  return error.message || 'Something went wrong. Please try again.'
}

const fetchVirtualExperiencePageData = async () => {
  const [programData, enrollmentData] = await Promise.all([
    getExperiencePrograms(),
    getMyExperienceEnrollments(),
  ])

  return {
    programs: programData,
    enrollments: enrollmentData,
  }
}

function VirtualExperience() {
  const [programs, setPrograms] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [submissions, setSubmissions] = useState([])

  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [enrollingId, setEnrollingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    task: '',
    description: '',
    github_url: '',
    demo_url: '',
  })

  // Load programs and student's enrollments

  const loadPageData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchVirtualExperiencePageData()

      setPrograms(data.programs)
      setEnrollments(data.enrollments)

      return data
    } catch (err) {
      console.error('Virtual experience loading error:', err)
      setError(getErrorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

    useEffect(() => {
    let isMounted = true

    const loadInitialPageData = async () => {
      try {
        const data = await fetchVirtualExperiencePageData()

        if (!isMounted) return

        setPrograms(data.programs)
        setEnrollments(data.enrollments)
        setError('')
      } catch (err) {
        if (!isMounted) return

        console.error('Virtual experience loading error:', err)
        setError(getErrorMessage(err))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialPageData()

    return () => {
      isMounted = false
    }
  }, [])

  // Find already enrolled programs
  const enrolledProgramIds = useMemo(
    () =>
      new Set(
        enrollments
          .map((item) => Number(item.program?.id ?? item.program))
          .filter(Number.isFinite)
      ),
    [enrollments]
  )

  // Open program details
  const openProgram = async (programId) => {
    setDetailLoading(true)
    setError('')
    setMessage('')
    setSelectedEnrollment(null)
    setSelectedProgram(null)
    setSubmissions([])

    setForm({
      task: '',
      description: '',
      github_url: '',
      demo_url: '',
    })

    try {
      const data = await getExperienceProgram(programId)
      setSelectedProgram(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }

  // Open student's enrolled experience
  const openEnrollment = async (enrollment) => {
    setDetailLoading(true)
    setError('')
    setMessage('')
    setSelectedProgram(null)
    setSelectedEnrollment(null)
    setSubmissions([])

    setForm({
      task: '',
      description: '',
      github_url: '',
      demo_url: '',
    })

    try {
      const programId = enrollment.program?.id ?? enrollment.program

      const [detail, submissionData, programDetail] = await Promise.all([
        getExperienceEnrollment(enrollment.id),
        getExperienceSubmissions(enrollment.id),
        getExperienceProgram(programId),
      ])

      setSelectedEnrollment({
        ...detail,
        program: {
          ...detail.program,
          tasks: programDetail.tasks || [],
        },
      })

      setSubmissions(submissionData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }

  // Enroll in a program
  const handleEnroll = async (programId) => {
    setEnrollingId(programId)
    setError('')
    setMessage('')

    try {
      await enrollInExperience(programId)

      const refreshedData = await loadPageData()

      const updatedEnrollments =
        refreshedData?.enrollments || await getMyExperienceEnrollments()

      setEnrollments(updatedEnrollments)

      const enrollment = updatedEnrollments.find(
        (item) =>
          Number(item.program?.id ?? item.program) === Number(programId)
      )

      if (enrollment) {
        await openEnrollment(enrollment)
      }

      setMessage('Successfully enrolled in this virtual experience!')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setEnrollingId(null)
    }
  }
  // Delete enrolled experience
const handleDeleteEnrollment = async (enrollment) => {
  const programTitle =
    enrollment.program?.title || 'this experience'

  const confirmed = window.confirm(
    `Are you sure you want to delete "${programTitle}"?\n\nYour enrollment and all submitted tasks will be permanently deleted. You can enroll again later.`
  )

  if (!confirmed) return

  setDeletingId(enrollment.id)
  setError('')
  setMessage('')

  try {
    await deleteExperienceEnrollment(enrollment.id)

    // Refresh enrollment list
    const updatedEnrollments =
      await getMyExperienceEnrollments()

    setEnrollments(updatedEnrollments)

    // Close details if the deleted enrollment is currently open
    if (
      Number(selectedEnrollment?.id) === Number(enrollment.id)
    ) {
      closeDetails()
    }

    setMessage(
      `${programTitle} enrollment deleted successfully.`
    )
  } catch (err) {
    setError(getErrorMessage(err))
  } finally {
    setDeletingId(null)
  }
}

  // Submit task
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedEnrollment || !form.task) {
      setError('Please select a task before submitting.')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await submitExperienceTask(selectedEnrollment.id, form)

      const programId =
        selectedEnrollment.program?.id ?? selectedEnrollment.program

      // Refresh enrollment, submissions and program tasks
      const [
        updatedEnrollment,
        updatedSubmissions,
        programDetail,
      ] = await Promise.all([
        getExperienceEnrollment(selectedEnrollment.id),
        getExperienceSubmissions(selectedEnrollment.id),
        getExperienceProgram(programId),
      ])

      // Preserve tasks after refreshing enrollment
      const enrollmentWithTasks = {
        ...updatedEnrollment,
        program: {
          ...updatedEnrollment.program,
          tasks: programDetail.tasks || [],
        },
      }

      setSelectedEnrollment(enrollmentWithTasks)
      setSubmissions(updatedSubmissions)

      setForm({
        task: '',
        description: '',
        github_url: '',
        demo_url: '',
      })

      setMessage(
        enrollmentWithTasks.status === 'COMPLETED'
          ? 'All required tasks have been submitted. Experience completed!'
          : 'Task submission saved successfully!'
      )

      // Refresh program and enrollment cards
      await loadPageData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Close details panel
  const closeDetails = () => {
    setSelectedProgram(null)
    setSelectedEnrollment(null)
    setSubmissions([])
    setError('')
    setMessage('')

    setForm({
      task: '',
      description: '',
      github_url: '',
      demo_url: '',
    })
  }

  // Submitted task IDs
  const completedTaskIds = useMemo(
    () => new Set(submissions.map((item) => Number(item.task))),
    [submissions]
  )

  const currentProgram = selectedEnrollment?.program || selectedProgram
  const currentTasks = selectedProgram?.tasks || []

  if (loading) {
    return (
      <main className="virtual-experience-page">
        <div className="ve-loading">
          <LoaderCircle className="ve-spin" size={32} />
          <p>Loading virtual experiences...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="virtual-experience-page">
      {/* HERO SECTION */}
      <section className="ve-hero">
        <div>
          <span className="ve-eyebrow">
            LEARNOVA CAREER PRACTICE
          </span>

          <h1>Virtual Work Experience</h1>

          <p>
            Build practical skills through guided, project-based tasks.
            Choose a role, complete the activities and track your progress.
          </p>

          <div className="ve-hero-note">
            <ShieldCheck size={16} />
            <span>Self-paced simulated experience</span>
          </div>
        </div>

        <div className="ve-hero-icon">
          <BriefcaseBusiness size={54} />
        </div>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="ve-alert ve-alert-error" role="alert">
          {error}

          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="ve-alert ve-alert-success" role="status">
          {message}

          <button type="button" onClick={() => setMessage('')}>
            Dismiss
          </button>
        </div>
      )}

      {/* AVAILABLE PROGRAMS */}
      <section className="ve-section-heading">
        <div>
          <span className="ve-section-kicker">
            EXPLORE OPPORTUNITIES
          </span>

          <h2>Available Programs</h2>

          <p>
            Choose a learning experience that matches your career goal.
          </p>
        </div>

        <button
          type="button"
          className="ve-refresh-btn"
          onClick={loadPageData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {programs.length === 0 ? (
        <div className="ve-empty">
          <BookOpen size={35} />
          <h3>No programs available</h3>
          <p>Please check again later.</p>
        </div>
      ) : (
        <section className="ve-program-grid">
          {programs.map((program) => {
            const isEnrolled = enrolledProgramIds.has(
              Number(program.id)
            )

            return (
              <article
                className="ve-program-card"
                key={program.id}
              >
                <div className="ve-program-top">
                  <div className="ve-program-icon">
                    <Code2 size={25} />
                  </div>

                  <span className="ve-level">
                    {program.level}
                  </span>
                </div>

                <h3>{program.title}</h3>

                <p className="ve-program-role">
                  {program.role}
                </p>

                <p className="ve-program-description">
                  {program.description}
                </p>

                <div className="ve-program-meta">
                  <span>
                    <Clock3 size={15} />
                    {program.duration_days} days
                  </span>

                  <span>
                    <Target size={15} />
                    {program.total_tasks} tasks
                  </span>
                </div>

                <div className="ve-program-actions">
                  <button
                    type="button"
                    className="ve-outline-btn"
                    onClick={() => openProgram(program.id)}
                  >
                    View Details
                  </button>

                  {isEnrolled ? (
                    <span className="ve-enrolled-label">
                      <CheckCircle2 size={15} />
                      Enrolled
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="ve-primary-btn"
                      disabled={enrollingId === program.id}
                      onClick={() => handleEnroll(program.id)}
                    >
                      {enrollingId === program.id ? (
                        <LoaderCircle
                          className="ve-spin"
                          size={16}
                        />
                      ) : (
                        'Enroll Now'
                      )}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* MY ENROLLMENTS */}
      <section className="ve-section-heading ve-enrollment-heading">
        <div>
          <span className="ve-section-kicker">
            YOUR JOURNEY
          </span>

          <h2>My Enrolled Experiences</h2>

          <p>
            Continue your tasks and monitor your completion progress.
          </p>
        </div>
      </section>

      {enrollments.length === 0 ? (
        <div className="ve-empty ve-empty-small">
          <Sparkles size={30} />

          <h3>You have not enrolled yet</h3>

          <p>
            Enroll in a program above to start your practical learning journey.
          </p>
        </div>
      ) : (
        <section className="ve-enrollment-list">
          {enrollments.map((enrollment) => {
            const percentage = Number(
              enrollment.progress_percentage || 0
            )

            const program = enrollment.program || {}

            return (
              <article
                className="ve-enrollment-card"
                key={enrollment.id}
              >
                <div className="ve-enrollment-info">
                  <div className="ve-enrollment-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div>
                    <h3>
                      {program.title ||
                        `Experience #${enrollment.id}`}
                    </h3>

                    <p>
                      {enrollment.completed_tasks || 0} of{' '}
                      {enrollment.total_tasks || 0} tasks completed
                    </p>
                  </div>
                </div>

                <div className="ve-progress-area">
                  <div className="ve-progress-label">
                    <span>Progress</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div
                    className="ve-progress-track"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="ve-enrollment-action">
                  <span
                    className={`ve-status ${
                      enrollment.status === 'COMPLETED'
                        ? 've-status-complete'
                        : ''
                    }`}
                  >
                    {enrollment.status}
                  </span>

                  <button
                    type="button"
                    className="ve-primary-btn"
                    onClick={() => openEnrollment(enrollment)}
                  >
                    {enrollment.status === 'COMPLETED'
                      ? 'View Experience'
                      : 'Continue'}

                  </button>
                  <button
                    type="button"
                    className="ve-delete-btn"
                    onClick={() => handleDeleteEnrollment(enrollment)}
                    disabled={deletingId === enrollment.id}
                  >
                    {deletingId === enrollment.id ? (
                      <LoaderCircle className="ve-spin" size={15} />
                    ) : (
                      <Trash2 size={15} />
                    )}

                    {deletingId === enrollment.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* DETAIL LOADING */}
      {detailLoading && (
        <div className="ve-detail-loading">
          <LoaderCircle className="ve-spin" size={24} />
          Loading experience details...
        </div>
      )}

      {/* PROGRAM DETAILS */}
      {selectedProgram && !detailLoading && (
        <section className="ve-detail-panel">
          <div className="ve-detail-heading">
            <div>
              <span className="ve-section-kicker">
                PROGRAM OVERVIEW
              </span>

              <h2>{selectedProgram.title}</h2>

              <p>{selectedProgram.description}</p>
            </div>

            <button
              type="button"
              className="ve-close-btn"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>

          <div className="ve-detail-meta">
            <span>
              <Clock3 size={16} />
              {selectedProgram.duration_days} days
            </span>

            <span>
              <Target size={16} />
              {selectedProgram.total_tasks} tasks
            </span>

            <span>
              <Sparkles size={16} />
              {selectedProgram.level}
            </span>
          </div>

          <h3 className="ve-task-heading">
            Program Tasks
          </h3>

          <div className="ve-task-list">
            {currentTasks.map((task, index) => (
              <article
                className="ve-task-card"
                key={task.id}
              >
                <div className="ve-task-number">
                  {index + 1}
                </div>

                <div>
                  <h4>{task.title}</h4>

                  <p>{task.description}</p>

                  {task.instructions && (
                    <p className="ve-task-instructions">
                      {task.instructions}
                    </p>
                  )}

                  <span className="ve-task-day">
                    Day {task.day_number}
                    {task.is_required
                      ? ' · Required'
                      : ' · Optional'}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {enrolledProgramIds.has(Number(selectedProgram.id)) && (
            <p className="ve-info-note">
              You are already enrolled. Open your enrollment below
              to submit tasks.
            </p>
          )}
        </section>
      )}

      {/* STUDENT WORKSPACE */}
      {selectedEnrollment && !detailLoading && (
        <section className="ve-detail-panel ve-workspace">
          <div className="ve-detail-heading">
            <div>
              <span className="ve-section-kicker">
                YOUR WORKSPACE
              </span>

              <h2>
                {currentProgram?.title || 'My Experience'}
              </h2>

              <p>
                Submit your work for each required task.
              </p>
            </div>

            <button
              type="button"
              className="ve-close-btn"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>

          {/* WORKSPACE STATS */}
          <div className="ve-workspace-stats">
            <div>
              <Trophy size={20} />
              <strong>
                {selectedEnrollment.completed_tasks || 0}
              </strong>
              <span>Tasks completed</span>
            </div>

            <div>
              <Target size={20} />
              <strong>
                {selectedEnrollment.total_tasks || 0}
              </strong>
              <span>Total tasks</span>
            </div>

            <div>
              <Sparkles size={20} />
              <strong>
                {selectedEnrollment.progress_percentage || 0}%
              </strong>
              <span>Progress</span>
            </div>
          </div>

          {/* WORKSPACE PROGRESS */}
          <div className="ve-workspace-progress">
            <div
              className="ve-progress-track"
              role="progressbar"
              aria-valuenow={Number(
                selectedEnrollment.progress_percentage || 0
              )}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                style={{
                  width: `${
                    Number(
                      selectedEnrollment.progress_percentage || 0
                    )
                  }%`,
                }}
              />
            </div>
          </div>

          {/* COMPLETION MESSAGE */}
          {selectedEnrollment.status === 'COMPLETED' ? (
            <div className="ve-completed-banner">
              <CheckCircle2 size={25} />

              <div>
                <strong>Experience completed!</strong>

                <p>
                  All required task submissions have been recorded.
                </p>
              </div>
            </div>
          ) : (
            /* TASK SUBMISSION FORM */
            <form
              className="ve-submission-form"
              onSubmit={handleSubmit}
            >
              <h3>Submit a Task</h3>

              <label htmlFor="ve-task">
                Select Task *
              </label>

              <select
                id="ve-task"
                value={form.task}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    task: event.target.value,
                  }))
                }
                required
              >
                <option value="">
                  Choose a task
                </option>

                {(selectedEnrollment.program?.tasks || []).map(
                  (task) => (
                    <option
                      key={task.id}
                      value={task.id}
                      disabled={completedTaskIds.has(
                        Number(task.id)
                      )}
                    >
                      {task.title}
                      {completedTaskIds.has(Number(task.id))
                        ? ' (Submitted)'
                        : ''}
                    </option>
                  )
                )}
              </select>

              <label htmlFor="ve-description">
                Work Description *
              </label>

              <textarea
                id="ve-description"
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Explain what you completed, what you learned and how you approached the task..."
                required
              />

              <label htmlFor="ve-github">
                GitHub Repository URL
              </label>

              <input
                id="ve-github"
                type="url"
                value={form.github_url}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    github_url: event.target.value,
                  }))
                }
                placeholder="https://github.com/username/project"
              />

              <label htmlFor="ve-demo">
                Live Demo URL
              </label>

              <input
                id="ve-demo"
                type="url"
                value={form.demo_url}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    demo_url: event.target.value,
                  }))
                }
                placeholder="https://your-project-demo.com"
              />

              <button
                type="submit"
                className="ve-primary-btn ve-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <LoaderCircle
                    className="ve-spin"
                    size={17}
                  />
                ) : (
                  <Send size={17} />
                )}

                {submitting
                  ? 'Submitting...'
                  : 'Submit Task'}
              </button>
            </form>
          )}

          {/* SUBMISSION HISTORY */}
          <div className="ve-submission-history">
            <h3>Submitted Tasks</h3>

            {submissions.length === 0 ? (
              <p className="ve-no-submissions">
                No tasks submitted yet.
              </p>
            ) : (
              submissions.map((submission) => (
                <article
                  className="ve-submission-item"
                  key={submission.id}
                >
                  <div className="ve-submission-check">
                    <CheckCircle2 size={19} />
                  </div>

                  <div className="ve-submission-content">
                    <strong>
                      {(selectedEnrollment.program?.tasks || [])
                        .find(
                          (task) =>
                            Number(task.id) ===
                            Number(submission.task)
                        )?.title ||
                        `Task #${submission.task}`}
                    </strong>

                    <p>{submission.description}</p>

                    <div className="ve-submission-links">
                      {submission.github_url && (
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Code2 size={14} />
                          GitHub
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {submission.demo_url && (
                        <a
                          href={submission.demo_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={14} />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>

                  <span className="ve-submitted-label">
                    Submitted
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {/* DISCLAIMER */}
      <p className="ve-disclaimer">
        <ShieldCheck size={15} />

        Learnova Virtual Work Experience is a simulated learning
        activity. Completion confirms that required submissions
        were recorded; it is not proof of employment, a real
        internship or independently verified work.
      </p>
    </main>
  )
}

export default VirtualExperience
