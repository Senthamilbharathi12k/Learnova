
import api from './api'

const SAVED_EVENT = 'learnova-saved-courses-updated'

const notifySavedCoursesUpdated = () => {
  window.dispatchEvent(new Event(SAVED_EVENT))
}

const extractSavedCourses = (data) => {
  const items = Array.isArray(data)
    ? data
    : (
        data?.saved_courses ||
        data?.savedCourses ||
        data?.courses ||
        data?.results ||
        data?.data ||
        []
      )

  if (!Array.isArray(items)) return []

  return items
    .map((item) => {
      const course = item.course || item.course_details || item

      return {
        ...course,
        id: course.id ?? item.course_id ?? item.id,
        savedAt:
          item.created_at ||
          item.saved_at ||
          item.savedAt ||
          null,
      }
    })
    .filter(
      (course) =>
        course.id !== null &&
        course.id !== undefined
    )
}

export const getSavedCourses = async () => {
  const response = await api.get('/saved-courses/')
  return extractSavedCourses(response.data)
}

export const isCourseSaved = async (courseId) => {
  if (courseId === null || courseId === undefined) return false

  const response = await api.get(
    `/saved-courses/${encodeURIComponent(courseId)}/status/`
  )

  return Boolean(
    response.data?.is_saved ??
    response.data?.saved ??
    response.data?.isSaved ??
    false
  )
}

export const saveCourse = async (course) => {
  if (!course || course.id === null || course.id === undefined) {
    throw new Error('Course ID is required to save a course.')
  }

  const response = await api.post('/saved-courses/', {
    course_id: course.id,
  })

  notifySavedCoursesUpdated()
  return response.data
}

export const removeSavedCourse = async (courseId) => {
  if (courseId === null || courseId === undefined) {
    throw new Error('Course ID is required to remove a saved course.')
  }

  const response = await api.delete(
    `/saved-courses/${encodeURIComponent(courseId)}/`
  )

  notifySavedCoursesUpdated()
  return response.data
}

export const clearSavedCourses = async () => {
  const courses = await getSavedCourses()

  await Promise.all(
    courses.map((course) => removeSavedCourse(course.id))
  )

  notifySavedCoursesUpdated()
}

export const subscribeSavedCourses = (callback) => {
  window.addEventListener(SAVED_EVENT, callback)

  return () => {
    window.removeEventListener(SAVED_EVENT, callback)
  }
}
