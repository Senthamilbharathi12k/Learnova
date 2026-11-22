
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import {
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
} from 'lucide-react'

import {
  getStudentProfile,
  updateStudentProfile,
} from '../../services/profileService'

import {
  validateStudentProfile,
} from '../../utils/validators'

import {
  updateOnboardingStep,
} from '../../services/onboardingService'

import './StudentProfile.css'

const initialProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  education: '',
  college: '',
  department: '',
  graduationYear: '',
  careerGoal: '',
  bio: '',
}

const mapBackendProfile = (data = {}) => ({
  fullName: data.full_name || data.fullName || '',
  email: data.email || '',
  phone: data.phone_number || data.phone || '',
  location: data.location || '',
  education: data.education || '',
  college: data.college_name || data.college || '',
  department: data.department || '',
  graduationYear: data.graduation_year
    ? String(data.graduation_year)
    : '',
  careerGoal: data.career_goal || data.careerGoal || '',
  bio: data.bio || '',
})

const getErrorMessage = (error) => {
  const data = error.response?.data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data?.message === 'string') {
    return data.message
  }

  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages)

        return `${field}: ${message}`
      })
      .join(' | ')
  }

  return error.message || 'Something went wrong. Please try again.'
}

const getCompletion = (profile) => {
  const fields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.location,
    profile.education,
    profile.college,
    profile.department,
    profile.graduationYear,
    profile.careerGoal,
    profile.bio,
  ]

  const completedFields = fields.filter((field) =>
    String(field || '').trim()
  ).length

  return Math.round((completedFields / fields.length) * 100)
}

function StudentProfile() {
  const [profile, setProfile] = useState(initialProfile)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isMock, setIsMock] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  const completion = useMemo(
    () => getCompletion(profile),
    [profile]
  )

  useEffect(() => {
    let active = true

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const response = await getStudentProfile()

        if (!active) return

        const profileData =
          response?.profile ||
          response?.data?.profile ||
            response

        setProfile(mapBackendProfile(profileData))
        setIsMock(Boolean(response?.isMock))
      } catch (error) {
        if (active) {
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSaved(false)
    setErrorMessage('')

    setValidationErrors((previous) => ({
      ...previous,
      [name]: '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = validateStudentProfile(profile)

    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Please correct the highlighted fields.')
      setSaved(false)
      return
    }

    try {
      setSaving(true)
      setSaved(false)
      setErrorMessage('')

      const payload = {
        full_name: profile.fullName.trim(),
        phone_number: profile.phone.trim(),
        location: profile.location.trim(),
        education: profile.education.trim(),
        college_name: profile.college.trim(),
        department: profile.department.trim(),
        graduation_year: profile.graduationYear
          ? Number(profile.graduationYear)
          : null,
        career_goal: profile.careerGoal.trim(),
        bio: profile.bio.trim(),
      }

      const response = await updateStudentProfile(payload)

      const profileData =
        response?.profile ||
        response?.data?.profile ||
        response

      const updatedProfile = mapBackendProfile(profileData)

      setProfile(updatedProfile)
      setIsMock(Boolean(response?.isMock))
      setSaved(true)
      setValidationErrors({})

      // Update onboarding only after successful profile save
      const updatedCompletion = getCompletion(updatedProfile)

      updateOnboardingStep(
        'profileCompleted',
        updatedCompletion === 100
      )
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  const initials = profile.fullName.trim()
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')
    : 'ST'

  const currentYear = new Date().getFullYear()

  if (loading) {
    return (
      <main className="student-profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <LoaderCircle
              className="profile-spinner"
              size={25}
            />
            Loading your profile...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="student-profile-page">
      <div className="profile-container">

        {/* Page Heading */}

        <motion.div
          className="profile-page-heading"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="profile-eyebrow">
            STUDENT ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Tell us about yourself so you can make the most of your
            learning journey with Learnova.
          </p>
        </motion.div>

        {/* Profile Completion */}

        <div className="profile-completion-card">
          <div className="profile-completion-info">
            <div>
              <h3>Profile Completion</h3>

              <p>
                Complete your profile to improve your learning
                experience.
              </p>
            </div>

            <strong>{completion}%</strong>
          </div>

          <div
            className="profile-progress-track"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Profile completion"
          >
            <div
              className="profile-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Main Layout */}

        <div className="profile-layout">

          {/* Profile Summary */}

          <motion.aside
            className="profile-summary-card"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="profile-avatar">
              {initials}
            </div>

            <h2>{profile.fullName || 'Your Name'}</h2>

            <p className="profile-summary-email">
              {profile.email || 'Your email address'}
            </p>

            <div className="profile-summary-divider" />

            <div className="profile-summary-item">
              <GraduationCap size={19} />
              <span>
                {profile.education || 'Education not added'}
              </span>
            </div>

            <div className="profile-summary-item">
              <BriefcaseBusiness size={19} />
              <span>
                {profile.careerGoal || 'Career goal not added'}
              </span>
            </div>

            <div className="profile-summary-item">
              <MapPin size={19} />
              <span>
                {profile.location || 'Location not added'}
              </span>
            </div>

            <div className="profile-summary-note">
              <UserRound size={17} />

              <span>
                Keep your information updated to improve your
                learning experience.
              </span>
            </div>
          </motion.aside>

          {/* Profile Form */}

          <motion.section
            className="profile-form-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="profile-form-heading">
              <div>
                <h2>Personal Information</h2>

                <p>
                  Enter your details in the fields below.
                </p>
              </div>

              <div className="profile-heading-icon">
                <UserRound size={23} />
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Basic Details */}

              <div className="profile-form-section">
                <h3>
                  <UserRound size={18} />
                  Basic Details
                </h3>

                <div className="profile-fields-grid">

                  <div className="profile-field">
                    <label htmlFor="fullName">
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      maxLength={150}
                      required
                    />

                    {validationErrors.fullName && (
                      <small className="profile-field-error">
                        {validationErrors.fullName}
                      </small>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="email">
                      Email Address *
                    </label>

                    <div className="profile-input-with-icon">
                      <Mail size={17} />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        placeholder="Your registered email"
                        readOnly
                      />
                    </div>

                    {validationErrors.email && (
                      <small className="profile-field-error">
                        {validationErrors.email}
                      </small>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <div className="profile-input-with-icon">
                      <Phone size={17} />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        maxLength={20}
                      />
                    </div>

                    {validationErrors.phone && (
                      <small className="profile-field-error">
                        {validationErrors.phone}
                      </small>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="location">
                      Location
                    </label>

                    <div className="profile-input-with-icon">
                      <MapPin size={17} />

                      <input
                        id="location"
                        name="location"
                        value={profile.location}
                        onChange={handleChange}
                        placeholder="City, State"
                        maxLength={150}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Education Details */}

              <div className="profile-form-section">
                <h3>
                  <GraduationCap size={18} />
                  Education Details
                </h3>

                <div className="profile-fields-grid">

                  <div className="profile-field">
                    <label htmlFor="education">
                      Education Level *
                    </label>

                    <input
                      id="education"
                      name="education"
                      value={profile.education}
                      onChange={handleChange}
                      placeholder="e.g. B.E Computer Science"
                      maxLength={150}
                      required
                    />

                    {validationErrors.education && (
                      <small className="profile-field-error">
                        {validationErrors.education}
                      </small>
                    )}
                  </div>

                  <div className="profile-field">
                    <label htmlFor="college">
                      College / Institution
                    </label>

                    <input
                      id="college"
                      name="college"
                      value={profile.college}
                      onChange={handleChange}
                      placeholder="Enter institution name"
                      maxLength={200}
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="department">
                      Department / Specialization
                    </label>

                    <input
                      id="department"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      maxLength={150}
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="graduationYear">
                      Graduation Year
                    </label>

                    <select
                      id="graduationYear"
                      name="graduationYear"
                      value={profile.graduationYear}
                      onChange={handleChange}
                    >
                      <option value="">Select year</option>

                      {Array.from(
                        { length: 12 },
                        (_, index) => {
                          const year = currentYear + index - 2

                          return (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          )
                        }
                      )}
                    </select>

                    {validationErrors.graduationYear && (
                      <small className="profile-field-error">
                        {validationErrors.graduationYear}
                      </small>
                    )}
                  </div>

                </div>
              </div>

              {/* Career Details */}

              <div className="profile-form-section">
                <h3>
                  <BriefcaseBusiness size={18} />
                  Career Details
                </h3>

                <div className="profile-field">
                  <label htmlFor="careerGoal">
                    Career Goal
                  </label>

                  <input
                    id="careerGoal"
                    name="careerGoal"
                    value={profile.careerGoal}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                    maxLength={150}
                  />
                </div>

                <div className="profile-field profile-bio-field">
                  <label htmlFor="bio">
                    About Me
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Write a short introduction about yourself..."
                    rows={4}
                    maxLength={500}
                  />

                  <span className="profile-character-count">
                    {profile.bio.length}/500 characters
                  </span>

                  {validationErrors.bio && (
                    <small className="profile-field-error">
                      {validationErrors.bio}
                    </small>
                  )}
                </div>
              </div>

              {/* Error Message */}

              {errorMessage && (
                <div
                  className="profile-error-message"
                  role="alert"
                >
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              {/* Success Message */}

              {saved && (
                <div
                  className="profile-save-message"
                  role="status"
                >
                  <CheckCircle2 size={18} />

                  Profile details saved successfully!

                  {isMock && (
                    <span>
                      (Saved locally for frontend testing.)
                    </span>
                  )}
                </div>
              )}

              {/* Mock Notice */}

              {isMock && (
                <p className="profile-mock-notice">
                  Frontend testing mode: profile changes are stored
                  in this browser only.
                </p>
              )}

              {/* Save Button */}

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle
                      className="profile-spinner"
                      size={18}
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              {/* Next Step - Only after successful save + 100% */}

              {saved && completion === 100 && (
                <div className="profile-next-step-container">
                  <div className="profile-next-step-info">
                    <CheckCircle2 size={20} />

                    <div>
                      <h3>Profile Completed!</h3>

                      <p>
                        Great! Your next step is to choose your
                        skills and interests.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/student/skills"
                    className="profile-next-step-button"
                  >
                    Choose Your Skills & Interests
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}

            </form>
          </motion.section>
        </div>
      </div>
    </main>
  )
}

export default StudentProfile
