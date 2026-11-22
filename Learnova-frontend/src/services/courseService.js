
import api from './api'

// ==========================================
// MODULE 05: COURSE RECOMMENDATIONS
// ==========================================

export const getCourseRecommendations = async () => {
  const response = await api.get('/courses/recommendations/')
  return response.data
}

export const getStudentSkills = async () => {
  const response = await api.get('/student/skills/')
  return response.data
}

export const getStudentInterests = async () => {
  const response = await api.get('/student/interests/')
  return response.data
}

// ==========================================
// MODULE 06: COURSE DISCOVERY
// ==========================================

export const getCourseDiscovery = async (filters = {}) => {
  const params = {}

  const search = filters.search?.trim()

  if (search) {
    params.search = search
  }

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
