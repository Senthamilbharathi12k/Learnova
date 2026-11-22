const STORAGE_KEY = 'learnova_course_comparison_v1'
const COMPARISON_EVENT = 'learnova-course-comparison-updated'

export const MAX_COMPARE_COURSES = 2

const notifyComparisonUpdated = () => {
  window.dispatchEvent(new Event(COMPARISON_EVENT))
}

export const getComparisonCourses = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    // Keep only the first two courses if older data contains more.
    const limitedCourses = parsed.slice(0, MAX_COMPARE_COURSES)

    if (limitedCourses.length !== parsed.length) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(limitedCourses)
      )
    }

    return limitedCourses
  } catch (error) {
    console.error('Unable to read comparison courses:', error)
    return []
  }
}

const storeComparisonCourses = (courses) => {
  const limitedCourses = courses.slice(0, MAX_COMPARE_COURSES)

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(limitedCourses)
  )

  notifyComparisonUpdated()
}

export const isCourseInComparison = (courseId) => {
  if (courseId === null || courseId === undefined) {
    return false
  }

  return getComparisonCourses().some(
    (course) => String(course.id) === String(courseId)
  )
}

export const addCourseToComparison = (course) => {
  if (!course || course.id === null || course.id === undefined) {
    throw new Error('A valid course ID is required.')
  }

  const current = getComparisonCourses()

  if (
    current.some(
      (item) => String(item.id) === String(course.id)
    )
  ) {
    return {
      courses: current,
      status: 'already-added',
    }
  }

  if (current.length >= MAX_COMPARE_COURSES) {
    return {
      courses: current,
      status: 'limit-reached',
    }
  }

  const updated = [...current, course]

  storeComparisonCourses(updated)

  return {
    courses: updated,
    status: 'added',
  }
}

export const removeCourseFromComparison = (courseId) => {
  const updated = getComparisonCourses().filter(
    (course) => String(course.id) !== String(courseId)
  )

  storeComparisonCourses(updated)

  return updated
}

export const clearComparisonCourses = () => {
  storeComparisonCourses([])
  return []
}

export const subscribeComparisonCourses = (callback) => {
  window.addEventListener(COMPARISON_EVENT, callback)

  return () => {
    window.removeEventListener(COMPARISON_EVENT, callback)
  }
}