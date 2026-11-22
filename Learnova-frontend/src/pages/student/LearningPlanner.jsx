
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  BookOpen,
  X,
  LoaderCircle,
} from 'lucide-react'

import {
  getPlannerTasks,
  addPlannerTask,
  updatePlannerTask,
  deletePlannerTask,
  togglePlannerTask,
} from '../../services/learningPlannerService'

import './LearningPlanner.css'

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekStart = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  result.setHours(0, 0, 0, 0)
  return result
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const calculateDuration = (start, end) => {
  if (!start || !end) return 0

  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  return (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60
}

const formatHours = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes} min`
  if (remainingMinutes === 0) return `${hours} hr`

  return `${hours} hr ${remainingMinutes} min`
}

const emptyForm = {
  title: '',
  course: '',
  date: getLocalDate(),
  startTime: '09:00',
  endTime: '10:00',
  category: 'Study',
  notes: '',
}

function LearningPlanner() {
const [tasks, setTasks] = useState([])
const [loading, setLoading] = useState(true)

const [weekStart, setWeekStart] = useState(() =>
  getWeekStart(new Date())
)
const [selectedDate, setSelectedDate] = useState(getLocalDate())
const [showForm, setShowForm] = useState(false)
const [editingId, setEditingId] = useState(null)
const [form, setForm] = useState(emptyForm)
const [message, setMessage] = useState('')
const [error, setError] = useState('')

const refreshTasks = useCallback(async () => {
  try {
    const data = await getPlannerTasks()

    setTasks(data)
    setError('')
    return true
  } catch (err) {
    console.error('Unable to load planner tasks:', err)
    setError('Unable to load your study tasks. Please try again.')
    return false
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => {
  let isMounted = true

  const fetchInitialTasks = async () => {
    try {
      const data = await getPlannerTasks()

      if (!isMounted) return

      setTasks(data)
      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Unable to load planner tasks:', err)
      setError('Unable to load your study tasks. Please try again.')
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  fetchInitialTasks()

  return () => {
    isMounted = false
  }
}, [])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index)

      return {
        date: getLocalDate(date),
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        number: date.getDate(),
        isToday: getLocalDate(date) === getLocalDate(),
      }
    })
  }, [weekStart])

  const weekEnd = addDays(weekStart, 6)

  const weekTasks = useMemo(() => {
    const start = getLocalDate(weekStart)
    const end = getLocalDate(weekEnd)

    return tasks
      .filter((task) => task.date >= start && task.date <= end)
      .sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(
          `${b.date} ${b.startTime}`
        )
      )
  }, [tasks, weekStart, weekEnd])

  const selectedTasks = useMemo(() => {
    return weekTasks.filter((task) => task.date === selectedDate)
  }, [weekTasks, selectedDate])

  const weeklyMinutes = weekTasks.reduce(
    (total, task) =>
      total + Math.round(calculateDuration(task.startTime, task.endTime) * 60),
    0
  )

  const completedTasks = weekTasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length

  const pendingTasks = weekTasks.length - completedTasks

  const completedMinutes = weekTasks
    .filter((task) => task.status === 'COMPLETED')
    .reduce(
      (total, task) =>
        total + Math.round(calculateDuration(task.startTime, task.endTime) * 60),
      0
    )

  const openAddForm = () => {
    setEditingId(null)
    setForm({ ...emptyForm, date: selectedDate })
    setError('')
    setMessage('')
    setShowForm(true)
  }

  const openEditForm = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      course: task.course || '',
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      category: task.category || 'Study',
      notes: task.notes || '',
    })
    setError('')
    setMessage('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
  event.preventDefault()
  setError('')
  setMessage('')

  if (!form.title.trim()) {
    setError('Please enter a task title.')
    return
  }

  if (!form.date || !form.startTime || !form.endTime) {
    setError('Please fill in the date and time fields.')
    return
  }

  if (form.endTime <= form.startTime) {
    setError('End time must be later than start time.')
    return
  }

  try {
    const cleanTask = {
      ...form,
      title: form.title.trim(),
      course: form.course.trim(),
      notes: form.notes.trim(),
    }

    if (editingId) {
      await updatePlannerTask(editingId, cleanTask)
      setMessage('Study task updated successfully.')
    } else {
      await addPlannerTask(cleanTask)
      setMessage('Study task added successfully.')
    }

    setSelectedDate(form.date)
    setWeekStart(getWeekStart(new Date(`${form.date}T12:00:00`)))
    closeForm()
    await refreshTasks()
  } catch (err) {
    console.error('Unable to save planner task:', err)
    setError(
      err.response?.data?.message ||
      'Unable to save this task. Please try again.'
    )
  }
}

  const handleDelete = async (taskId) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this study task?'
  )

  if (!confirmed) return

  try {
    await deletePlannerTask(taskId)
    await refreshTasks()
    setMessage('Study task deleted.')
  } catch (err) {
    console.error('Unable to delete planner task:', err)
    setError(
      err.response?.data?.message ||
      'Unable to delete this task.'
    )
  }
}

 const handleToggle = async (taskId) => {
  const selectedTask = tasks.find(
    (task) => String(task.id) === String(taskId)
  )

  if (!selectedTask) return

  try {
    await togglePlannerTask(selectedTask)
    await refreshTasks()
  } catch (err) {
    console.error('Unable to update task status:', err)
    setError(
      err.response?.data?.message ||
      'Unable to update task status.'
    )
  }
}
  const changeWeek = (direction) => {
    const nextWeek = addDays(weekStart, direction * 7)
    setWeekStart(nextWeek)
    setSelectedDate(getLocalDate(nextWeek))
  }

  const goToCurrentWeek = () => {
    const today = getLocalDate()
    setWeekStart(getWeekStart(new Date()))
    setSelectedDate(today)
  }

  const monthLabel = weekStart.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="learning-planner-page">
      <div className="planner-header">
        <div>
          <span className="planner-eyebrow">PLAN YOUR LEARNING</span>
          <h1>Learning Planner</h1>
          <p>Organize your study time and stay consistent with your goals.</p>
        </div>

        <button className="planner-primary-button" onClick={openAddForm}>
          <Plus size={18} />
          Add Study Task
        </button>
      </div>

      {message && (
        <div className="planner-message success" role="status">
          <CheckCircle2 size={17} />
          {message}
          <button onClick={() => setMessage('')} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      {error && !showForm && (
        <div className="planner-message error" role="alert">
          {error}
          <button onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="planner-stats">
        <div className="planner-stat-card">
          <div className="planner-stat-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Total Scheduled</span>
            <strong>{formatHours(weeklyMinutes)}</strong>
            <small>This week</small>
          </div>
        </div>

        <div className="planner-stat-card">
          <div className="planner-stat-icon completed">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completed Tasks</span>
            <strong>{completedTasks}</strong>
            <small>{formatHours(completedMinutes)} completed</small>
          </div>
        </div>

        <div className="planner-stat-card">
          <div className="planner-stat-icon pending">
            <BookOpen size={21} />
          </div>
          <div>
            <span>Pending Tasks</span>
            <strong>{pendingTasks}</strong>
            <small>Remaining this week</small>
          </div>
        </div>
      </div>

      <section className="planner-calendar-card">
        <div className="planner-calendar-heading">
          <div>
            <h2>
              <CalendarDays size={21} />
              Weekly Schedule
            </h2>
            <p>{monthLabel}</p>
          </div>

          <div className="planner-week-controls">
            <button onClick={() => changeWeek(-1)} aria-label="Previous week">
              <ChevronLeft size={20} />
            </button>
            <button className="planner-today-button" onClick={goToCurrentWeek}>
              Today
            </button>
            <button onClick={() => changeWeek(1)} aria-label="Next week">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="planner-week-grid">
          {weekDays.map((day) => {
            const dayTaskCount = weekTasks.filter(
              (task) => task.date === day.date
            ).length

            return (
              <button
                key={day.date}
                className={`planner-day ${
                  selectedDate === day.date ? 'active' : ''
                } ${day.isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span>{day.day}</span>
                <strong>{day.number}</strong>
                <small>
                  {dayTaskCount > 0 ? `${dayTaskCount} tasks` : 'No tasks'}
                </small>
              </button>
            )
          })}
        </div>
      </section>

      <section className="planner-tasks-section">
        <div className="planner-tasks-heading">
          <div>
            <h2>Study Tasks</h2>
            <p>
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                'en-IN',
                { weekday: 'long', day: 'numeric', month: 'long' }
              )}
            </p>
          </div>

          <button className="planner-add-small" onClick={openAddForm}>
            <Plus size={17} />
            Add Task
          </button>
        </div>
         {loading ? (
          <div className="planner-empty">
            <LoaderCircle size={28} className="animate-spin" />
            <p>Loading your study tasks...</p>
          </div>
          ):
        selectedTasks.length === 0 ? (
          <div className="planner-empty">
            <div className="planner-empty-icon">
              <CalendarDays size={30} />
            </div>
            <h3>No study tasks planned</h3>
            <p>Add a study task to organize your learning schedule.</p>
            <button className="planner-primary-button" onClick={openAddForm}>
              <Plus size={18} />
              Create First Task
            </button>
          </div>
        ) : (
          <div className="planner-task-list">
            {selectedTasks.map((task) => (
              <article
                className={`planner-task-card ${
                  task.status === 'COMPLETED' ? 'task-completed' : ''
                }`}
                key={task.id}
              >
                <button
                  className="planner-task-check"
                  onClick={() => handleToggle(task.id)}
                  aria-label={
                    task.status === 'COMPLETED'
                      ? 'Mark as pending'
                      : 'Mark as completed'
                  }
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 size={23} />
                  ) : (
                    <Circle size={23} />
                  )}
                </button>

                <div className="planner-task-content">
                  <div className="planner-task-topline">
                    <span className="planner-category">
                      {task.category}
                    </span>
                    <span
                      className={`planner-status ${
                        task.status === 'COMPLETED' ? 'done' : 'waiting'
                      }`}
                    >
                      {task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <h3>{task.title}</h3>

                  {task.course && (
                    <p className="planner-task-course">
                      <BookOpen size={15} />
                      {task.course}
                    </p>
                  )}

                  <div className="planner-task-time">
                    <Clock size={15} />
                    {formatTime(task.startTime)} – {formatTime(task.endTime)}
                    <span>
                      {formatHours(
                        Math.round(
                          calculateDuration(task.startTime, task.endTime) * 60
                        )
                      )}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="planner-task-notes">{task.notes}</p>
                  )}
                </div>

                <div className="planner-task-actions">
                  <button
                    onClick={() => openEditForm(task)}
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(task.id)}
                    aria-label="Delete task"
                    title="Delete task"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="planner-modal-overlay" onMouseDown={closeForm}>
          <div
            className="planner-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="planner-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="planner-modal-header">
              <div>
                <span className="planner-eyebrow">STUDY SCHEDULE</span>
                <h2 id="planner-form-title">
                  {editingId ? 'Edit Study Task' : 'Add Study Task'}
                </h2>
              </div>
              <button onClick={closeForm} aria-label="Close form">
                <X size={21} />
              </button>
            </div>

            {error && (
              <div className="planner-message error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="planner-form">
              <label>
                Task Title *
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Learn Python Functions"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Course / Subject
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. Python Programming"
                  maxLength={100}
                />
              </label>

              <div className="planner-form-row">
                <label>
                  Study Date *
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="Study">Study</option>
                    <option value="Practice">Practice</option>
                    <option value="Revision">Revision</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                  </select>
                </label>
              </div>

              <div className="planner-form-row">
                <label>
                  Start Time *
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  End Time *
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add your study notes or goals..."
                  rows={3}
                  maxLength={500}
                />
              </label>

              <div className="planner-form-actions">
                <button
                  type="button"
                  className="planner-cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="planner-primary-button">
                  {editingId ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningPlanner
