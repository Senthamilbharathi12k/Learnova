import api from './api'

export const getPortfolioResources = async () => {
  const response = await api.get('/portfolio-resources/')
  return response.data
}