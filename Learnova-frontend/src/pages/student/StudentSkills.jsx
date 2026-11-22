
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Brain,
  Plus,
  X,
  Code2,
  Palette,
  BarChart3,
  Database,
  Globe,
  Lightbulb,
  CheckCircle2,
  Save,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'

import {
  getSkills,
  getInterests,
  getStudentSkills,
  getStudentInterests,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
  addStudentInterest,
  deleteStudentInterest,
} from '../../services/skillsService'

import { updateOnboardingStep } from '../../services/onboardingService'

import './StudentSkills.css'

const proficiencyOptions = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
]

const interestIconMap = {
  'Web Development': Code2,
  'Frontend Development': Code2,
  'Backend Development': Code2,
  'Full Stack Development': Globe,
  'Mobile App Development': Globe,
  'Data Science': BarChart3,
  'Data Analytics': BarChart3,
  'Artificial Intelligence': Brain,
  'Machine Learning': Brain,
  'Deep Learning': Brain,
  'Database Management': Database,
  'UI/UX Design': Palette,
  'Cloud Computing': Globe,
  Cybersecurity: Brain,
  'Business & Entrepreneurship': Lightbulb,
  'Blockchain Development': Database,
  DevOps: Code2,
  'Game Development': Sparkles,
  'Internet of Things (IoT)': Globe,
  'Software Engineering': Code2,
  'Software Testing & Automation': CheckCircle2,
}

// Common API error handler
const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data

  if (typeof data === 'string') return data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data?.message === 'string') {
    return data.message
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]

    if (Array.isArray(firstValue)) {
      return firstValue.join(', ')
    }

    if (typeof firstValue === 'string') {
      return firstValue
    }
  }
  if (!error?.response) {
    return error?.message ||
      'Unable to connect to the server. Check your connection and try again.'
  }
  return fallback
}
// Map student skills
const mapStudentSkills = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    skillId:
      typeof item.skill === 'object'
        ? item.skill?.id
        : item.skill,
    name:
      item.skill_details?.name ||
      (typeof item.skill === 'object' ? item.skill?.name : '') ||
      'Unknown Skill',
    level: String(item.proficiency || 'BEGINNER').toUpperCase(),
  }))

// Map student interests
const mapStudentInterests = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    interestId:
      typeof item.interest === 'object'
        ? item.interest?.id
        : item.interest,
    name:
      item.interest_details?.name ||
      (typeof item.interest === 'object'
        ? item.interest?.name
        : '') ||
      'Unknown Interest',
  }))
function StudentSkills() {
  const [availableSkills, setAvailableSkills] = useState([])
  const [availableInterests, setAvailableInterests] = useState([])
  const [skills, setSkills] = useState([])
  const [interests, setInterests] = useState([])
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState('BEGINNER')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  // Load skills and interests from API
  const loadData = useCallback(async () => {
    const [
      masterSkills,
      masterInterests,
      studentSkills,
      studentInterests,
    ] = await Promise.all([
      getSkills(),
      getInterests(),
      getStudentSkills(),
      getStudentInterests(),
    ])

    const mappedSkills = mapStudentSkills(studentSkills)
    const mappedInterests = mapStudentInterests(studentInterests)

    setAvailableSkills(Array.isArray(masterSkills) ? masterSkills : [])
    setAvailableInterests(
      Array.isArray(masterInterests) ? masterInterests : []
    )

    setSkills(mappedSkills)
    setInterests(mappedInterests)

    return {
      skills: mappedSkills,
      interests: mappedInterests,
    }
  }, [])

  // Initial loading
  useEffect(() => {
    let active = true
    const initializePage = async () => {
      try {
        setLoading(true)
        setError('')
        await loadData()
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(
              err,
              'Unable to load your skills and interests. Please refresh the page.'
            )
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initializePage()

    return () => {
      active = false
    }
  }, [loadData])
  // Clear messages
  const clearMessages = () => {
    setError('')
    setSuccessMessage('')
    setSaved(false)
  }
  // Add skill
  const addSkill = async (name = skillName) => {
    const cleanedName = name.trim()
    if (!cleanedName) {
      setError('Please enter a skill name.')
      setSuccessMessage('')
      return
    }
    const selectedSkill = availableSkills.find(
      (item) =>
        item.name?.toLowerCase() === cleanedName.toLowerCase()
    )
    if (!selectedSkill) {
      setError(
        'Please choose a skill from the available suggestions.'
      )
      setSuccessMessage('')
      return
    }
    if (
      skills.some((item) => item.skillId === selectedSkill.id)
    ) {
      setError('This skill has already been added.')
      setSuccessMessage('')
      return
    }

    try {
      setSaving(true)
      clearMessages()

      await addStudentSkill(selectedSkill.id, skillLevel)
      await loadData()

      setSkillName('')

      setSuccessMessage(
        `${selectedSkill.name} added successfully.`
      )
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to add this skill. Please try again.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // Update proficiency
  const handleLevelChange = async (studentSkillId, newLevel) => {
    try {
      setSaving(true)
      clearMessages()

      await updateStudentSkill(studentSkillId, newLevel)
      await loadData()

      setSuccessMessage(
        'Proficiency level updated successfully.'
      )
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to update proficiency level. Please try again.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // Remove skill
  const removeSkill = async (studentSkillId) => {
    try {
      setSaving(true)
      clearMessages()

      await deleteStudentSkill(studentSkillId)
      await loadData()

      setSuccessMessage('Skill removed successfully.')
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to remove this skill. Please try again.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // Add or remove interest
  const toggleInterest = async (interest) => {
    if (saving) return

    const existingInterest = interests.find(
      (item) => item.interestId === interest.id
    )

    try {
      setSaving(true)
      clearMessages()

      if (existingInterest) {
        await deleteStudentInterest(existingInterest.id)
      } else {
        await addStudentInterest(interest.id)
      }

      await loadData()

      setSuccessMessage(
        existingInterest
          ? `${interest.name} removed successfully.`
          : `${interest.name} added successfully.`
      )
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to update your interests. Please try again.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // Save and verify skills and interests
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (saving) return

    if (skills.length === 0 && interests.length === 0) {
      setSaved(false)
      setError(
        'Add at least one skill or select one interest before saving.'
      )
      setSuccessMessage('')
      return
    }

    try {
      setSaving(true)
      clearMessages()

      // Verify saved data from server
      const verifiedData = await loadData()

      if (
        verifiedData.skills.length === 0 &&
        verifiedData.interests.length === 0
      ) {
        throw new Error(
          'No saved skills or interests were found.'
        )
      }

      // Complete onboarding only after verification
      updateOnboardingStep('skillsCompleted', true)

      setSaved(true)

      setSuccessMessage(
        'Your skills and interests have been saved and verified successfully!'
      )
    } catch (err) {
      updateOnboardingStep('skillsCompleted', false)

      setSaved(false)

      setError(
        getErrorMessage(
          err,
          'Unable to verify your saved data. Please try again.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // Refresh data
  const refreshData = async () => {
    if (saving) return

    try {
      setLoading(true)
      clearMessages()

      await loadData()

      setSuccessMessage(
        'Your skills and interests have been refreshed.'
      )
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to refresh your data. Please try again.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  // Loading screen
  if (loading) {
    return (
      <main className="student-skills-page">
        <div className="skills-container">
          <div className="skills-empty-state">
            <Brain size={30} />
            <p>Loading your skills and interests...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="student-skills-page">
      <div className="skills-container">

        {/* PAGE HEADING */}
        <motion.header
          className="skills-page-heading"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="skills-eyebrow">
            KNOW YOURSELF BETTER
          </span>

          <h1>Skills & Interests</h1>

          <p>
            Add the skills you have and choose the topics you love.
            This helps Learnova understand your learning goals.
          </p>
        </motion.header>

        <form onSubmit={handleSubmit}>

          {/* SKILLS PANEL */}
          <motion.section
            className="skills-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="skills-panel-heading">
              <div className="skills-heading-icon">
                <Brain size={24} />
              </div>

              <div>
                <h2>My Skills</h2>
                <p>
                  Add your technical and soft skills with your proficiency level.
                </p>
              </div>
            </div>

            {/* SKILL INPUT */}
            <div className="skill-entry-row">
              <div className="skill-entry-input">
                <label htmlFor="skillName">Skill Name</label>

                <input
                  id="skillName"
                  list="available-skill-options"
                  value={skillName}
                  onChange={(event) => {
                    setSkillName(event.target.value)
                    clearMessages()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addSkill()
                    }
                  }}
                  placeholder="e.g. Python, Communication, React.js"
                  disabled={saving}
                  autoComplete="off"
                />

                <datalist id="available-skill-options">
                  {availableSkills.map((skill) => (
                    <option
                      key={skill.id}
                      value={skill.name}
                    />
                  ))}
                </datalist>
              </div>

              <div className="skill-entry-level">
                <label htmlFor="skillLevel">
                  Proficiency Level
                </label>

                <select
                  id="skillLevel"
                  value={skillLevel}
                  onChange={(event) => {
                    setSkillLevel(event.target.value)
                    clearMessages()
                  }}
                  disabled={saving}
                >
                  {proficiencyOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="add-skill-button"
                onClick={() => addSkill()}
                disabled={saving}
              >
                <Plus size={18} />
                {saving ? 'Please wait...' : 'Add Skill'}
              </button>
            </div>

            {/* SKILL SUGGESTIONS */}
            <div className="skill-suggestions">
              <span className="suggestion-label">
                POPULAR SKILLS
              </span>

              <div className="suggestion-list">
                {availableSkills.map((suggestion) => {
                  const exists = skills.some(
                    (skill) => skill.skillId === suggestion.id
                  )

                  return (
                    <button
                      type="button"
                      key={suggestion.id}
                      className={`suggestion-chip ${
                        exists ? 'suggestion-added' : ''
                      }`}
                      disabled={exists || saving}
                      onClick={() => addSkill(suggestion.name)}
                    >
                      {exists ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Plus size={14} />
                      )}

                      {suggestion.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ADDED SKILLS */}
            <div className="added-skills-area">
              <div className="added-skills-heading">
                <h3>Added Skills</h3>
                <span>{skills.length} skills</span>
              </div>

              {skills.length === 0 ? (
                <div className="skills-empty-state">
                  <Code2 size={30} />
                  <p>
                    No skills added yet. Enter a skill or choose a suggestion above.
                  </p>
                </div>
              ) : (
                <div className="added-skills-list">
                  {skills.map((skill) => (
                    <div
                      className="added-skill-item"
                      key={skill.id}
                    >
                      <div className="added-skill-details">
                        <span className="added-skill-name">
                          {skill.name}
                        </span>

                        <select
                          className={`skill-level-badge ${skill.level.toLowerCase()}`}
                          value={skill.level}
                          disabled={saving}
                          aria-label={`Proficiency level for ${skill.name}`}
                          onChange={(event) =>
                            handleLevelChange(
                              skill.id,
                              event.target.value
                            )
                          }
                        >
                          {proficiencyOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        className="remove-skill-button"
                        onClick={() => removeSkill(skill.id)}
                        disabled={saving}
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* INTERESTS PANEL */}
          <motion.section
            className="skills-panel interests-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="skills-panel-heading">
              <div className="skills-heading-icon gold-heading-icon">
                <Lightbulb size={24} />
              </div>

              <div>
                <h2>My Interests</h2>
                <p>
                  Select all the learning areas that interest you.
                </p>
              </div>
            </div>

            <div className="interest-selection-info">
              <span>Choose as many as you like</span>
              <strong>{interests.length} selected</strong>
            </div>

            {availableInterests.length === 0 ? (
              <div className="skills-empty-state">
                <Lightbulb size={28} />
                <p>No interests are currently available.</p>
              </div>
            ) : (
              <div className="interests-grid">
                {availableInterests.map((interest) => {
                  const Icon =
                    interestIconMap[interest.name] || Lightbulb

                  const selected = interests.some(
                    (item) => item.interestId === interest.id
                  )

                  return (
                    <button
                      type="button"
                      key={interest.id}
                      className={`interest-option ${
                        selected ? 'interest-selected' : ''
                      }`}
                      aria-pressed={selected}
                      disabled={saving}
                      onClick={() => toggleInterest(interest)}
                    >
                      <span className="interest-option-icon">
                        <Icon size={21} />
                      </span>

                      <span className="interest-option-name">
                        {interest.name}
                      </span>

                      <span className="interest-check">
                        {selected && <CheckCircle2 size={18} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* SELECTED INTERESTS */}
            {interests.length > 0 && (
              <div className="selected-interests">
                <span>YOUR SELECTED INTERESTS</span>

                <div>
                  {interests.map((interest) => (
                    <span
                      className="selected-interest-chip"
                      key={interest.id}
                    >
                      {interest.name}

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          toggleInterest({
                            id: interest.interestId,
                            name: interest.name,
                          })
                        }
                        aria-label={`Remove ${interest.name}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* ERROR MESSAGE */}
          {error && (
            <p
              className="skills-error skills-bottom-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div
              className="skills-save-message"
              role="status"
            >
              <CheckCircle2 size={19} />
              {successMessage}
            </div>
          )}

          {/* SAVE SECTION */}
          <div className="skills-save-area">
            <p>
              Your selections can be updated whenever your goals change.
            </p>

            <div className="skills-action-buttons">
              <button
                type="button"
                className="skills-refresh-button"
                onClick={refreshData}
                disabled={saving || loading}
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                type="submit"
                className="save-skills-button"
                disabled={saving}
              >
                <Save size={18} />
                {saving
                  ? 'Verifying...'
                  : 'Save Skills & Interests'}
              </button>
            </div>
          </div>
        </form>

        {/* NEXT STEP */}
        {saved && (
          <motion.div
            className="skills-next-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="skills-next-step-content">
              <CheckCircle2 size={23} />

              <div>
                <h3>Skills & Interests Completed!</h3>
                <p>
                  Your next step is to complete your Skill Assessment.
                </p>
              </div>
            </div>

            <Link
              to="/student/assessment"
              className="skills-next-step-button"
            >
              Start Skill Assessment
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}

      </div>
    </main>
  )
}

export default StudentSkills
