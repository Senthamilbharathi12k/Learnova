
import api from './api'

// Supports normal arrays and paginated API responses
const getCollection = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}

// =========================================
// MASTER SKILLS
// =========================================

export const getSkills = async () => {
  const response = await api.get('/skills/')
  return getCollection(response.data)
}

// =========================================
// MASTER INTERESTS
// =========================================

export const getInterests = async () => {
  const response = await api.get('/interests/')
  return getCollection(response.data)
}

// =========================================
// STUDENT SKILLS
// =========================================

export const getStudentSkills = async () => {
  const response = await api.get('/student/skills/')
  return getCollection(response.data)
}

// =========================================
// STUDENT INTERESTS
// =========================================

export const getStudentInterests = async () => {
  const response = await api.get('/student/interests/')
  return getCollection(response.data)
}

// =========================================
// ADD STUDENT SKILL
// =========================================

export const addStudentSkill = async (skillId, proficiency) => {
  const response = await api.post('/student/skills/', {
    skill: skillId,
    proficiency,
  })

  return response.data
}

// =========================================
// UPDATE STUDENT SKILL PROFICIENCY
// =========================================

export const updateStudentSkill = async (
  studentSkillId,
  proficiency
) => {
  const response = await api.patch(
    `/student/skills/${studentSkillId}/`,
    {
      proficiency,
    }
  )

  return response.data
}

// =========================================
// DELETE STUDENT SKILL
// =========================================

export const deleteStudentSkill = async (studentSkillId) => {
  const response = await api.delete(
    `/student/skills/${studentSkillId}/`
  )

  return response.data
}

// =========================================
// ADD STUDENT INTEREST
// =========================================

export const addStudentInterest = async (interestId) => {
  const response = await api.post('/student/interests/', {
    interest: interestId,
  })

  return response.data
}

// =========================================
// DELETE STUDENT INTEREST
// =========================================

export const deleteStudentInterest = async (
  studentInterestId
) => {
  const response = await api.delete(
    `/student/interests/${studentInterestId}/`
  )

  return response.data
}
