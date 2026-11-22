
import api from './api'

const PROFILE_STORAGE_KEY = 'learnova_student_profile'

const mockProfile = {
  full_name: 'Student Name',
  email: 'student@example.com',
  phone_number: '',
  location: '',
  education: '',
  college_name: '',
  department: '',
  graduation_year: null,
  career_goal: '',
  bio: '',
}

const isMockEnabled = () =>
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_PROFILE_MOCK === 'true'

const getStoredMockProfile = () => {
  try {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)

    return storedProfile
      ? JSON.parse(storedProfile)
      : mockProfile
  } catch {
    return mockProfile
  }
}

const saveMockProfile = (profile) => {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  )

  return profile
}

// Fetch dashboard summary
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/')
  return response.data
}

// Fetch student profile
export const getStudentProfile = async () => {
  try {
    const response = await api.get('/auth/profile/')
    return response.data
  } catch (error) {
    if (!isMockEnabled()) {
      throw error
    }

    console.warn(
      'Profile API unavailable. Using local mock profile for frontend testing.'
    )

    return {
      profile: getStoredMockProfile(),
      isMock: true,
    }
  }
}

// Update student profile
export const updateStudentProfile = async (payload) => {
  try {
    const response = await api.patch('/auth/profile/', payload)
    return response.data
  } catch (error) {
    if (!isMockEnabled()) {
      throw error
    }

    console.warn(
      'Profile API unavailable. Saving profile locally for frontend testing.'
    )

    const updatedProfile = {
      ...getStoredMockProfile(),
      ...payload,
    }

    return {
      profile: saveMockProfile(updatedProfile),
      isMock: true,
    }
  }
}
