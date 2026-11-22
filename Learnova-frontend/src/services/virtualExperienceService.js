
import api from './api'

const getList = (data, keys = []) => {
  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }

  if (Array.isArray(data?.results)) return data.results
  return []
}

export const getExperiencePrograms = async () => {
  const response = await api.get('/virtual-experience/programs/')
  return getList(response.data, ['programs'])
}

export const getExperienceProgram = async (programId) => {
  const response = await api.get(
    `/virtual-experience/programs/${programId}/`
  )
  return response.data
}

export const getMyExperienceEnrollments = async () => {
  const response = await api.get('/virtual-experience/enrollments/')
  return getList(response.data, ['enrollments'])
}

export const enrollInExperience = async (programId) => {
  const response = await api.post('/virtual-experience/enrollments/', {
    program: Number(programId),
  })
  return response.data
}

export const getExperienceEnrollment = async (enrollmentId) => {
  const response = await api.get(
    `/virtual-experience/enrollments/${enrollmentId}/`
  )
  return response.data
}

export const getExperienceSubmissions = async (enrollmentId) => {
  const response = await api.get(
    `/virtual-experience/enrollments/${enrollmentId}/submissions/`
  )
  return getList(response.data, ['submissions'])
}

export const submitExperienceTask = async (
  enrollmentId,
  submission
) => {
  const payload = {
    task: Number(submission.task),
    description: submission.description || '',
    github_url: submission.github_url || '',
    demo_url: submission.demo_url || '',
  }

  const response = await api.post(
    `/virtual-experience/enrollments/${enrollmentId}/submissions/`,
    payload
  )

  return response.data
}
// Delete an enrolled experience
export const deleteExperienceEnrollment = async (enrollmentId) => {
  const response = await api.delete(
    `/virtual-experience/enrollments/${enrollmentId}/`
  )

  return response.data
}