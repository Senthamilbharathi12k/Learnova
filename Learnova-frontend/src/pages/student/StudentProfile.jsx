
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Phone,
  Save,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api'
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

const mapBackendProfile = (data) => ({
  fullName: data.full_name || '',
  email: data.email || '',
  phone: data.phone_number || '',
  location: data.location || '',
  education: data.education || '',
  college: data.college_name || '',
  department: data.department || '',
  graduationYear: data.graduation_year
    ? String(data.graduation_year)
    : '',
  careerGoal: data.career_goal || '',
  bio: data.bio || '',
})

const getErrorMessage = (error) => {
  const data = error.response?.data

  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.message === 'string') return data.message

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

function StudentProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const response = await api.get('/auth/profile/')

        setProfile(mapBackendProfile(response.data.profile))
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSaved(false)
    setErrorMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

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

      const response = await api.patch('/auth/profile/', payload)

      setProfile(mapBackendProfile(response.data.profile))
      setSaved(true)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
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

  if (loading) {
    return (
      <main className="student-profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            Loading your profile...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="student-profile-page">
      <div className="profile-container">

        <motion.div
          className="profile-page-heading"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="profile-eyebrow">STUDENT ACCOUNT</span>
          <h1>My Profile</h1>
          <p>
            Tell us about yourself so you can make the most of your
            learning journey with Learnova.
          </p>
        </motion.div>

        <div className="profile-layout">

          {/* Profile Summary */}
          <motion.aside
            className="profile-summary-card"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="profile-avatar">{initials}</div>

            <h2>{profile.fullName || 'Your Name'}</h2>

            <p className="profile-summary-email">
              {profile.email || 'Your email address'}
            </p>

            <div className="profile-summary-divider" />

            <div className="profile-summary-item">
              <GraduationCap size={19} />
              <span>{profile.education || 'Education not added'}</span>
            </div>

            <div className="profile-summary-item">
              <BriefcaseBusiness size={19} />
              <span>{profile.careerGoal || 'Career goal not added'}</span>
            </div>

            <div className="profile-summary-item">
              <MapPin size={19} />
              <span>{profile.location || 'Location not added'}</span>
            </div>

            <div className="profile-summary-note">
              <UserRound size={17} />
              <span>
                Keep your information updated to improve your learning
                experience.
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
                <p>Enter your details in the fields below.</p>
              </div>

              <div className="profile-heading-icon">
                <UserRound size={23} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Basic Details */}
              <div className="profile-form-section">
                <h3>
                  <UserRound size={18} /> Basic Details
                </h3>

                <div className="profile-fields-grid">

                  <div className="profile-field">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="email">Email Address *</label>

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
                  </div>

                  <div className="profile-field">
                    <label htmlFor="phone">Phone Number</label>

                    <div className="profile-input-with-icon">
                      <Phone size={17} />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label htmlFor="location">Location</label>

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
                  <GraduationCap size={18} /> Education Details
                </h3>

                <div className="profile-fields-grid">

                  <div className="profile-field">
                    <label htmlFor="education">Education Level *</label>
                    <input
                      id="education"
                      name="education"
                      value={profile.education}
                      onChange={handleChange}
                      placeholder="e.g. B.E Computer Science"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="college">College / Institution</label>
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

                      {Array.from({ length: 12 }, (_, index) => {
                        const year = new Date().getFullYear() + index - 2

                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                </div>
              </div>

              {/* Career Details */}
              <div className="profile-form-section">
                <h3>
                  <BriefcaseBusiness size={18} /> Career Details
                </h3>

                <div className="profile-field">
                  <label htmlFor="careerGoal">Career Goal</label>
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
                  <label htmlFor="bio">About Me</label>
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
                </div>
              </div>

              {errorMessage && (
                <div
                  className="profile-error-message"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              {saved && (
                <div className="profile-save-message" role="status">
                  <CheckCircle2 size={18} />
                  Profile details saved successfully!
                </div>
              )}

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </motion.section>
        </div>
      </div>
    </main>
  )
}

export default StudentProfile
