
import api from './api'

// Student registration
export const registerStudent = async (formData) => {
  const response = await api.post('/auth/register/', formData)
  return response.data
}

// Verify registration OTP
export const verifyRegistrationOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp/', {
    email,
    otp,
  })
  return response.data
}

// Student login
export const loginStudent = async (email, password) => {
  const response = await api.post('/auth/login/', {
    email,
    password,
  })
  return response.data
}

// Request password reset OTP
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password/', {
    email,
  })
  return response.data
}

// Verify password reset OTP
export const verifyResetOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-reset-otp/', {
    email,
    otp,
  })
  return response.data
}

// Reset password
export const resetPassword = async (
  email,
  new_password,
  confirm_password
) => {
  const response = await api.post('/auth/reset-password/', {
    email,
    new_password,
    confirm_password,
  })
  return response.data
}

// Manual token refresh helper
export const refreshAccessToken = async (refresh) => {
  const response = await api.post('/auth/token/refresh/', {
    refresh,
  })
  return response.data
}

// Logout student
export const logoutStudent = async (refresh) => {
  const response = await api.post('/auth/logout/', {
    refresh,
  })
  return response.data
}

// Save authenticated session
export const saveAuthSession = (data) => {
  const accessToken = data?.tokens?.access
  const refreshToken = data?.tokens?.refresh

  if (!accessToken || !refreshToken) {
    throw new Error('Authentication tokens are missing.')
  }

  sessionStorage.setItem('accessToken', accessToken)
  sessionStorage.setItem('refreshToken', refreshToken)

  if (data.user) {
    sessionStorage.setItem('user', JSON.stringify(data.user))
  } else {
    sessionStorage.removeItem('user')
  }

  window.dispatchEvent(new Event('auth-change'))
}

// Clear authenticated session
export const clearAuthSession = () => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('user')

  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  window.dispatchEvent(new Event('auth-change'))
}
