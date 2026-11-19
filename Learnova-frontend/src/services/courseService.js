
import api from './api'

// Module 4: Rule-based course recommendations
export const getCourseRecommendations = async () => {
  const response = await api.get('/courses/recommendations/')
  return response.data
}

// Student skills and interests
export const getStudentSkills = async () => {
  const response = await api.get('/student/skills/')
  return response.data
}

export const getStudentInterests = async () => {
  const response = await api.get('/student/interests/')
  return response.data
}

// Module 5: Get all active courses from backend
export const getCourseDiscovery = async (filters = {}) => {
  const params = {}

  if (filters.search?.trim()) params.search = filters.search.trim()
  if (filters.category && filters.category !== 'All') {
    params.category = filters.category
  }
  if (filters.learningMode && filters.learningMode !== 'All') {
    params.learning_mode = filters.learningMode.toUpperCase()
  }
  if (filters.pricingType && filters.pricingType !== 'All') {
    params.pricing_type = filters.pricingType.toUpperCase()
  }

  const response = await api.get('/courses/discovery/', { params })
  return response.data
}
