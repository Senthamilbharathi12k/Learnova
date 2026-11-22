
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email) => {
  return EMAIL_REGEX.test(String(email || '').trim())
}

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return true

  const cleanedPhone = phone.replace(/[\s()-]/g, '')

  return /^\+?[0-9]{10,15}$/.test(cleanedPhone)
}

export const validateGraduationYear = (year) => {
  if (!year) return true

  const numericYear = Number(year)
  const currentYear = new Date().getFullYear()

  return (
    Number.isInteger(numericYear) &&
    numericYear >= 1950 &&
    numericYear <= currentYear + 10
  )
}

export const validateStudentProfile = (profile) => {
  const errors = {}

  if (!profile.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (profile.fullName.trim().length < 2) {
    errors.fullName = 'Name must contain at least 2 characters.'
  }

  if (!profile.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!validateEmail(profile.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!profile.education.trim()) {
    errors.education = 'Education level is required.'
  }

  if (!validatePhone(profile.phone)) {
    errors.phone = 'Enter a valid phone number (10–15 digits).'
  }

  if (!validateGraduationYear(profile.graduationYear)) {
    errors.graduationYear = 'Enter a valid graduation year.'
  }

  if (profile.bio.length > 500) {
    errors.bio = 'About Me must not exceed 500 characters.'
  }

  return errors
}
