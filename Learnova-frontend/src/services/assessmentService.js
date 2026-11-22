
import api from './api'

// Convert backend category format
const mapCategory = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  level: category.level,
  duration: category.duration,
  questionCount: category.question_count,
})

// Convert backend question format
const mapQuestion = (question) => ({
  id: question.id,
  question: question.question,
  options: question.options,
  order: question.order,
})

// Convert review answer format
const mapReviewAnswer = (item) => ({
  questionId: item.question_id,
  question: item.question,
  options: item.options,
  selectedAnswer: item.selected_answer,
  correctAnswer: item.correct_answer,
  isCorrect: item.is_correct,
})

// Convert backend attempt format
const mapResult = (result) => ({
  id: result.id,
  categoryId: result.category_id,
  categoryName: result.category_name,
  score: result.score,
  correctAnswers: result.correct_answers,
  totalQuestions: result.total_questions,
  level: result.level,
  answers: result.answers,
  reviewAnswers: (result.review_answers || []).map(mapReviewAnswer),
  completedAt: result.completed_at,
})

// Get assessment categories
export const getAssessmentCategories = async () => {
  const response = await api.get('/assessments/categories/')

  return (response.data.categories || []).map(mapCategory)
}

// Get questions for selected category
export const getAssessmentQuestions = async (categoryId) => {
  const response = await api.get(
    `/assessments/categories/${encodeURIComponent(categoryId)}/questions/`
  )

  return (response.data.questions || []).map(mapQuestion)
}

// Submit answers
export const submitAssessment = async (categoryId, answers) => {
  const response = await api.post('/assessments/submit/', {
    category_id: categoryId,
    answers,
  })

  return mapResult(response.data.result)
}

// Get assessment history
export const getAssessmentHistory = async () => {
  const response = await api.get('/assessments/history/')

  return (response.data.history || []).map(mapResult)
}
// Delete an assessment result
export const deleteAssessmentAttempt = async (attemptId) => {
  const response = await api.delete(
    `/assessments/history/${attemptId}/`
  )

  return response.data
}
