
import api from './api'

// Fetch authenticated student's dashboard summary
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/')
  return response.data
}
