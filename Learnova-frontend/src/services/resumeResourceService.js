
import api from './api'

export const getResumeResources = async () => {
  const response = await api.get('/resume-resources/')
  return response.data
}
