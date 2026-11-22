
import api from './api'

// ==========================================
// COURSE COMPLETION
// ==========================================

export const markCourseCompleted = async (courseId) => {
  const response = await api.post(
    `/learning-progress/courses/${courseId}/complete/`,
    {
      confirm: true,
    }
  )

  return response.data
}

// ==========================================
// GET COURSE FINAL ASSESSMENT QUESTIONS
// ==========================================

export const getCourseFinalAssessmentQuestions = async (courseId) => {
  const response = await api.get(
    `/assessments/courses/${courseId}/questions/`
  )

  return response.data
}

// ==========================================
// SUBMIT COURSE FINAL ASSESSMENT
// ==========================================

export const submitCourseFinalAssessment = async (
  courseId,
  answers
) => {
  const response = await api.post(
    `/assessments/courses/${courseId}/submit/`,
    {
      answers,
    }
  )

  return response.data
}

// ==========================================
// GET COURSE FINAL ASSESSMENT HISTORY
// ==========================================

export const getCourseFinalAssessmentHistory = async (courseId) => {
  const response = await api.get(
    `/assessments/courses/${courseId}/history/`
  )

  return response.data
}
