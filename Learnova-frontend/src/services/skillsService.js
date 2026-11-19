
import api from './api'

// Master lists
export const getSkills = async () => {
  const response = await api.get('/skills/')
  return response.data
}

export const getInterests = async () => {
  const response = await api.get('/interests/')
  return response.data
}

// Logged-in student's selections
export const getStudentSkills = async () => {
  const response = await api.get('/student/skills/')
  return response.data
}

export const getStudentInterests = async () => {
  const response = await api.get('/student/interests/')
  return response.data
}

// Add skill
export const addStudentSkill = async (skillId, proficiency) => {
  const response = await api.post('/student/skills/', {
    skill: skillId,
    proficiency,
  })
  return response.data
}

// Update proficiency
export const updateStudentSkill = async (studentSkillId, proficiency) => {
  const response = await api.patch(
    `/student/skills/${studentSkillId}/`,
    { proficiency }
  )
  return response.data
}

// Delete skill
export const deleteStudentSkill = async (studentSkillId) => {
  const response = await api.delete(
    `/student/skills/${studentSkillId}/`
  )
  return response.data
}

// Add interest
export const addStudentInterest = async (interestId) => {
  const response = await api.post('/student/interests/', {
    interest: interestId,
  })
  return response.data
}

// Delete interest
export const deleteStudentInterest = async (studentInterestId) => {
  const response = await api.delete(
    `/student/interests/${studentInterestId}/`
  )
  return response.data
}
