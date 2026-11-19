
import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate Axios instance for refresh requests.
// This prevents the refresh request from triggering its own interceptor.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error)
    } else {
      request.resolve(token)
    }
  })

  failedQueue = []
}

const clearSessionAndRedirect = () => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('user')

  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  window.dispatchEvent(new Event('auth-change'))

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// Attach access token to every authenticated request.
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Refresh access token automatically when an API returns 401.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''

    // Do not refresh for authentication-related requests.
    const excludedUrls = [
      '/auth/login/',
      '/auth/register/',
      '/auth/verify-otp/',
      '/auth/forgot-password/',
      '/auth/verify-reset-otp/',
      '/auth/reset-password/',
      '/auth/token/refresh/',
    ]

    if (
      excludedUrls.some((url) => requestUrl.includes(url)) ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // If another request is already refreshing, wait for it.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      })
    }

    const refreshToken =
      sessionStorage.getItem('refreshToken') ||
      localStorage.getItem('refreshToken')

    if (!refreshToken) {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    isRefreshing = true

    try {
      const response = await refreshClient.post(
        '/auth/token/refresh/',
        { refresh: refreshToken }
      )

      const newAccessToken = response.data?.access
      const newRefreshToken = response.data?.refresh

      if (!newAccessToken) {
        throw new Error('Access token refresh failed.')
      }

      sessionStorage.setItem('accessToken', newAccessToken)

      // Update refresh token only if the backend rotates it.
      if (newRefreshToken) {
        sessionStorage.setItem('refreshToken', newRefreshToken)
      }

      window.dispatchEvent(new Event('auth-change'))

      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      clearSessionAndRedirect()

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
