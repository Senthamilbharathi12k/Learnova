
import api from './api'

const getCourseList = (data) => {
  if (Array.isArray(data?.courses)) return data.courses
  if (Array.isArray(data?.progress)) return data.progress
  if (Array.isArray(data?.results)) return data.results
  return []
}

const getSessionList = (data) => {
  if (Array.isArray(data?.sessions)) return data.sessions
  if (Array.isArray(data?.history)) return data.history
  return []
}

const mapCourse = (item) => {
  const course = item.course || {}

  return {
    id: item.course_id ?? course.id ?? item.id,
    title:
      item.course_name ||
      item.title ||
      item.name ||
      course.name ||
      course.title ||
      'Untitled Course',
    category:
      item.category ||
      item.category_name ||
      course.category ||
      'General',
    totalLessons: Number(
      item.total_lessons ?? item.totalLessons ?? 20
    ),
    completedLessons: Number(
      item.completed_lessons ?? item.completedLessons ?? 0
    ),
    learningHours: Number(
      item.learning_hours ?? item.learningHours ?? 0
    ),
    completionStatus:
      item.completion_status ||
      item.completionStatus ||
      'IN_PROGRESS',
    completedAt:
      item.completed_at ||
      item.completedAt ||
      null,
    updatedAt: item.updated_at || item.updatedAt || null,
  }
}

const mapSession = (item) => ({
  id: item.id,
  courseId: item.course_id ?? item.course?.id ?? item.course,
  hours: Number(item.hours || 0),
  date:
    item.date ||
    item.created_at ||
    item.createdAt ||
    new Date().toISOString(),
})

export const getLearningProgress = async () => {
  const response = await api.get('/learning-progress/')
  const data = response.data || {}

  return {
    courses: getCourseList(data).map(mapCourse),
    sessions: getSessionList(data).map(mapSession),
  }
}

export const updateCourseProgress = async (courseId, updates) => {
  const payload = {}

  if (updates.completedLessons !== undefined) {
    payload.completed_lessons = Number(updates.completedLessons)
  }

  if (updates.totalLessons !== undefined) {
    payload.total_lessons = Number(updates.totalLessons)
  }

  const response = await api.patch(
    `/learning-progress/courses/${courseId}/`,
    payload
  )

  return response.data
}

export const addLearningSession = async (courseId, hours) => {
  const amount = Number(hours)

  if (!Number.isFinite(amount) || amount <= 0 || amount > 24) {
    throw new Error(
      'Enter a valid learning time between 0 and 24 hours.'
    )
  }

  const response = await api.post(
    '/learning-progress/sessions/',
    {
      course_id: courseId,
      hours: amount,
    }
  )

  return response.data
}
