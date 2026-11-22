import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  Clock,
  GraduationCap,
  Monitor,
  IndianRupee,
  Trash2,
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  RefreshCw,
  UserCheck,
  Heart,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'

import {
  getComparisonCourses,
  removeCourseFromComparison,
  clearComparisonCourses,
  subscribeComparisonCourses,
} from '../../services/courseComparisonService'

import { getCourseRecommendations } from '../../services/courseService'

import './CourseComparison.css'

const MAX_COMPARE_COURSES = 2

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

const formatValue = (value, fallback = 'Not specified') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return String(value)
}

const normalize = (value) =>
  String(value ?? '').trim().toLowerCase()

const getCourseName = (course) =>
  course?.name || course?.title || 'Untitled Course'

const getResources = (course) => {
  if (Array.isArray(course?.resources)) {
    return course.resources
  }

  if (Array.isArray(course?.filtered_resources)) {
    return course.filtered_resources
  }

  return []
}

const getList = (data) => {
  if (Array.isArray(data)) return data

  if (data && typeof data === 'object') {
    for (const key of ['recommendations', 'results', 'courses']) {
      if (Array.isArray(data[key])) {
        return data[key]
      }
    }
  }

  return []
}

const getDuration = (course) => {
  if (course?.duration_weeks) {
    const weeks = Number(course.duration_weeks)

    if (Number.isFinite(weeks) && weeks > 0) {
      return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`
    }
  }

  return formatValue(course?.duration, 'Flexible Duration')
}

const getPricingSummary = (course) => {
  const resources = getResources(course)

  const types = resources.map((resource) =>
    normalize(resource.pricing_type)
  )

  const hasFree = types.includes('free')
  const hasPaid = types.includes('paid')

  if (hasFree && hasPaid) return 'Free & Paid'
  if (hasFree) return 'Free'
  if (hasPaid) return 'Paid'

  return 'Not specified'
}

const getPercentage = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  if (!Number.isFinite(number)) return null

  return Math.min(100, Math.max(0, number))
}

const getEvidenceName = (item) => {
  if (typeof item === 'string') return item

  return (
    item?.name ||
    item?.skill_name ||
    item?.interest_name ||
    item?.title ||
    item?.skill ||
    item?.interest ||
    ''
  )
}

const getEvidenceList = (value) => {
  if (Array.isArray(value)) {
    return value.map(getEvidenceName).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value]
  }

  return []
}

const getRecommendation = (course, recommendations) => {
  return recommendations.find((item) => {
    const sameId =
      course?.id !== undefined &&
      course?.id !== null &&
      item?.id !== undefined &&
      item?.id !== null &&
      String(course.id) === String(item.id)

    const sameName =
      normalize(getCourseName(course)) ===
      normalize(item?.name || item?.title)

    return sameId || sameName
  })
}

const getAssessmentDetails = (recommendation) => {
  if (!recommendation) {
    return {
      average: null,
      assessedCount: 0,
      performance: [],
    }
  }

  const average = getPercentage(
    recommendation.assessment_average_score ??
    recommendation.assessment_performance?.average_score ??
    recommendation.assessment_performance?.average ??
    recommendation.assessment_performance?.score
  )

  const assessedCount = Number(
    recommendation.assessed_skills_count ??
    recommendation.assessment_performance?.assessed_skills_count ??
    0
  )

  let performance = recommendation.assessment_performance

  if (!Array.isArray(performance)) {
    performance =
      performance?.results ||
      performance?.skills ||
      performance?.details ||
      []
  }

  return {
    average,
    assessedCount: Number.isFinite(assessedCount) ? assessedCount : 0,
    performance: Array.isArray(performance) ? performance : [],
  }
}

const getMatchDetails = (course, recommendations) => {
  const recommendation = getRecommendation(course, recommendations)

  if (!recommendation) {
    return {
      recommendation: null,
      skillMatch: null,
      interestMatch: null,
      overallMatch: null,
      matchedSkills: [],
      matchedInterests: [],
      assessment: getAssessmentDetails(null),
    }
  }

  return {
    recommendation,

    skillMatch: getPercentage(
      recommendation.skill_match_percentage
    ),

    interestMatch: getPercentage(
      recommendation.interest_match_percentage
    ),

    overallMatch: getPercentage(
      recommendation.match_percentage ??
      recommendation.match_score
    ),

    matchedSkills: getEvidenceList(
      recommendation.matched_skills
    ),

    matchedInterests: getEvidenceList(
      recommendation.matched_interests
    ),

    assessment: getAssessmentDetails(recommendation),
  }
}

const getAdvantages = (course, matchDetails) => {
  const advantages = []
  const resources = getResources(course)

  if (matchDetails.skillMatch > 0) {
    advantages.push(
      `${matchDetails.skillMatch}% skill match with your existing skills`
    )
  }

  if (matchDetails.interestMatch > 0) {
    advantages.push(
      `${matchDetails.interestMatch}% interest match with your selected interests`
    )
  }

  if (matchDetails.matchedSkills.length > 0) {
    advantages.push(
      `Related skills: ${matchDetails.matchedSkills.join(', ')}`
    )
  }

  if (matchDetails.matchedInterests.length > 0) {
    advantages.push(
      `Related interests: ${matchDetails.matchedInterests.join(', ')}`
    )
  }

  if (
    resources.some(
      (resource) => normalize(resource.pricing_type) === 'free'
    )
  ) {
    advantages.push('Free learning resource available')
  }

  if (
    resources.some((resource) => Boolean(resource.external_url))
  ) {
    advantages.push('External learning resource links available')
  }

  if (course.learning_mode) {
    advantages.push(
      `${String(course.learning_mode).toLowerCase()} learning mode available`
    )
  }

  if (course.duration || course.duration_weeks) {
    advantages.push(`Course duration: ${getDuration(course)}`)
  }

  if (course.difficulty_level || course.level) {
    advantages.push(
      `Learning level: ${formatValue(
        course.difficulty_level || course.level
      )}`
    )
  }

  return advantages.length
    ? [...new Set(advantages)]
    : ['Course information is available for your review']
}

const getConsiderations = (course, matchDetails) => {
  const considerations = []
  const resources = getResources(course)

  if (matchDetails.skillMatch === null) {
    considerations.push('Skill match information is unavailable')
  } else if (matchDetails.skillMatch === 0) {
    considerations.push(
      'No matching skills were identified from your current skill profile'
    )
  }

  if (matchDetails.interestMatch === null) {
    considerations.push('Interest match information is unavailable')
  } else if (matchDetails.interestMatch === 0) {
    considerations.push(
      'No matching interests were identified from your selected interests'
    )
  }

  if (!resources.length) {
    considerations.push('No learning resources are listed')
  }

  if (!course.duration && !course.duration_weeks) {
    considerations.push('Course duration is not specified')
  }

  if (!course.learning_mode) {
    considerations.push('Learning mode is not specified')
  }

  if (!course.difficulty_level && !course.level) {
    considerations.push('Difficulty level is not specified')
  }

  if (
    resources.length > 0 &&
    !resources.some((resource) => resource.external_url)
  ) {
    considerations.push('No external resource link is provided')
  }

  if (matchDetails.assessment.assessedCount === 0) {
    considerations.push(
      'A related skill assessment has not been completed yet'
    )
  }

  return considerations
}

const getWhyMatched = (course) => {
  const reasons = []

  if (course.skillMatch !== null) {
    reasons.push(
      `Your Skill Match is ${course.skillMatch}%, based on your existing skills.`
    )
  }

  if (course.interestMatch !== null) {
    reasons.push(
      `Your Interest Match is ${course.interestMatch}%, based on your selected interests.`
    )
  }

  if (course.overallMatch !== null) {
    reasons.push(
      `The Overall Match is ${course.overallMatch}%, calculated by the existing recommendation method.`
    )
  }

  if (course.matchedSkills.length) {
    reasons.push(
      `Matching skills include ${course.matchedSkills.join(', ')}.`
    )
  }

  if (course.matchedInterests.length) {
    reasons.push(
      `Matching interests include ${course.matchedInterests.join(', ')}.`
    )
  }

  if (!reasons.length) {
    return 'Personalized matching details are not available for this course.'
  }

  return reasons.join(' ')
}

const getResourceType = (resource) =>
  normalize(resource?.pricing_type)

const getResourceTitle = (resource) =>
  resource?.title ||
  resource?.name ||
  'Learning Resource'

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

function CourseComparison() {
  const [courses, setCourses] = useState(() =>
    getComparisonCourses().slice(0, MAX_COMPARE_COURSES)
  )

  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(true)

  const [recommendationError, setRecommendationError] = useState('')

  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedPricing, setSelectedPricing] = useState('')
  const [decisionMessage, setDecisionMessage] = useState('')

  // --------------------------------------------------
  // SYNC COMPARISON COURSES
  // --------------------------------------------------

  const syncCourses = useCallback(() => {
    setCourses(
      getComparisonCourses().slice(0, MAX_COMPARE_COURSES)
    )
  }, [])

useEffect(() => {
  const unsubscribe =
    subscribeComparisonCourses(syncCourses)

  return unsubscribe
}, [syncCourses])

  // --------------------------------------------------
  // LOAD RECOMMENDATIONS
  // --------------------------------------------------

  useEffect(() => {
  let isMounted = true

  const fetchRecommendations = async () => {
    try {
      const response = await getCourseRecommendations()

      if (!isMounted) return

      setRecommendations(getList(response))
      setRecommendationError('')
    } catch (error) {
      if (!isMounted) return

      console.error(
        'Unable to load comparison recommendations:',
        error
      )

      setRecommendations([])

      setRecommendationError(
        'Personalized match scores are currently unavailable. You can still compare the course details.'
      )
    } finally {
      if (isMounted) {
        setRecommendationsLoading(false)
      }
    }
  }

  fetchRecommendations()

  return () => {
    isMounted = false
  }
}, [])

  // --------------------------------------------------
  // COMPARISON RESULTS
  // --------------------------------------------------

  const comparisonResults = useMemo(() => {
    return courses.slice(0, MAX_COMPARE_COURSES).map((course) => {
      const matchDetails = getMatchDetails(
        course,
        recommendations
      )

      const result = {
        ...course,
        ...matchDetails,
      }

      return {
        ...result,
        advantages: getAdvantages(course, matchDetails),
        considerations: getConsiderations(course, matchDetails),
      }
    })
  }, [courses, recommendations])

  const rankedCourses = useMemo(() => {
    return comparisonResults
      .filter((course) => course.overallMatch !== null)
      .sort(
        (a, b) => b.overallMatch - a.overallMatch
      )
  }, [comparisonResults])

  const recommendedCourse = rankedCourses[0] || null

  const selectedCourse = comparisonResults.find(
    (course) =>
      String(course.id) === String(selectedCourseId)
  )

  const selectedResources = selectedCourse
    ? getResources(selectedCourse).filter(
        (resource) =>
          getResourceType(resource) === selectedPricing
      )
    : []

  // --------------------------------------------------
  // ACTIONS
  // --------------------------------------------------

  const handleRemove = (courseId) => {
    removeCourseFromComparison(courseId)

    if (String(selectedCourseId) === String(courseId)) {
      setSelectedCourseId(null)
      setSelectedPricing('')
      setDecisionMessage('')
    }
  }

  const handleClear = () => {
    if (window.confirm('Remove all courses from comparison?')) {
      clearComparisonCourses()
      setSelectedCourseId(null)
      setSelectedPricing('')
      setDecisionMessage('')
    }
  }

  const handleSelectCourse = (course) => {
    setSelectedCourseId(course.id)
    setSelectedPricing('')

    setDecisionMessage(
      `You selected ${getCourseName(course)} as your preferred course.`
    )
  }

  const handlePricingSelect = (pricingType) => {
    setSelectedPricing(pricingType)
  }

  // --------------------------------------------------
  // OPEN EXACT RESOURCE URL
  // --------------------------------------------------

  const handleOpenResource = (resource) => {
    const externalUrl = resource?.external_url

    if (!externalUrl) {
      setDecisionMessage(
        'The selected learning resource does not have an external URL yet.'
      )
      return
    }

    try {
      const parsedUrl = new URL(externalUrl)

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setDecisionMessage(
          'This resource URL is not valid. Please contact the administrator.'
        )
        return
      }

      window.open(
        parsedUrl.href,
        '_blank',
        'noopener,noreferrer'
      )
    } catch {
      setDecisionMessage(
        'This resource URL is not valid. Please contact the administrator.'
      )
    }
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="course-comparison-page">
      {/* HERO */}

      <section className="comparison-hero">
        <div className="comparison-hero-content">
          <span className="comparison-eyebrow">
            <ArrowLeftRight size={17} />
            MAKE THE RIGHT CHOICE
          </span>

          <h1>
            Compare Courses.
            <span>Choose Your Future.</span>
          </h1>

          <p>
            Compare course details, learning resources and personalized
            matching scores. Make a confident learning decision with Learnova.
          </p>
        </div>
      </section>

      <section className="comparison-container">
        {/* PAGE HEADING */}

        <div className="comparison-heading">
          <div>
            <span className="comparison-label">
              COURSE COMPARISON
            </span>

            <h2>Your Selected Courses</h2>

            <p>
              {courses.length} of {MAX_COMPARE_COURSES} courses selected.
              Add two courses to compare them.
            </p>
          </div>

          <div className="comparison-heading-actions">
            <Link
              to="/student/courses"
              className="comparison-back-link"
            >
              <ArrowLeft size={16} />
              Explore Courses
            </Link>

            {courses.length > 0 && (
              <button
                type="button"
                className="comparison-clear-button"
                onClick={handleClear}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* EMPTY STATE */}

        {courses.length === 0 ? (
          <div className="comparison-empty">
            <div className="comparison-empty-icon">
              <ArrowLeftRight size={32} />
            </div>

            <h3>No Courses Selected</h3>

            <p>
              Explore courses and add two courses to compare their
              details and learning resources.
            </p>

            <Link
              to="/student/courses"
              className="comparison-primary-button"
            >
              <BookOpen size={17} />
              Explore Courses
            </Link>
          </div>
        ) : (
          <>
            {courses.length < MAX_COMPARE_COURSES && (
              <div className="comparison-info">
                Select one more course to start comparing.
              </div>
            )}

            {/* COURSE DETAILS TABLE */}

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="comparison-feature-heading">
                      Course Details
                    </th>

                    {comparisonResults.map((course) => (
                      <th key={course.id}>
                        <div className="comparison-course-header">
                          <span className="comparison-course-category">
                            {formatValue(course.category, 'General')}
                          </span>

                          <h3>{getCourseName(course)}</h3>

                          <button
                            type="button"
                            className="comparison-remove-button"
                            onClick={() => handleRemove(course.id)}
                          >
                            <X size={14} />
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th>
                      <BookOpen size={16} />
                      Course Name
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {getCourseName(course)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>
                      <GraduationCap size={16} />
                      Category
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {formatValue(course.category)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>
                      <GraduationCap size={16} />
                      Difficulty Level
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {formatValue(
                          course.difficulty_level || course.level
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>
                      <Clock size={16} />
                      Duration
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {getDuration(course)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>
                      <Monitor size={16} />
                      Learning Mode
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {formatValue(course.learning_mode)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>
                      <IndianRupee size={16} />
                      Resource Pricing
                    </th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {getPricingSummary(course)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>Description</th>

                    {comparisonResults.map((course) => (
                      <td
                        key={course.id}
                        className="comparison-description"
                      >
                        {formatValue(course.description)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>Available Resources</th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        {getResources(course).length}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <th>Resource Details</th>

                    {comparisonResults.map((course) => (
                      <td key={course.id}>
                        <div className="comparison-resources">
                          {getResources(course).length ? (
                            getResources(course).map(
                              (resource, index) => (
                                <div
                                  className="comparison-resource-item"
                                  key={
                                    resource.id ||
                                    `${resource.title}-${index}`
                                  }
                                >
                                  <strong>
                                    {formatValue(
                                      resource.title,
                                      'Learning Resource'
                                    )}
                                  </strong>

                                  <span>
                                    {formatValue(
                                      resource.pricing_type,
                                      'Price not specified'
                                    )}
                                  </span>

                                  {resource.external_url && (
                                    <a
                                      href={resource.external_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Open Resource
                                      <ExternalLink size={13} />
                                    </a>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <span>Resources not available</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PERSONALIZED ANALYSIS */}

            {courses.length === MAX_COMPARE_COURSES && (
              <>
                <section className="comparison-analysis">
                  <div className="comparison-analysis-heading">
                    <span className="comparison-label">
                      <Target size={15} />
                      PERSONALIZED ANALYSIS
                    </span>

                    <h2>How These Courses Match You</h2>

                    <p>
                      Your match scores are based on your existing
                      skills and selected interests.
                    </p>
                  </div>

                  {recommendationsLoading ? (
                    <div className="comparison-analysis-message">
                      <RefreshCw
                        size={18}
                        className="comparison-spin"
                      />
                      Loading personalized matching scores...
                    </div>
                  ) : (
                    <>
                      {recommendationError && (
                        <div className="comparison-analysis-message">
                          <AlertCircle size={18} />
                          {recommendationError}
                        </div>
                      )}

                      {/* INDIVIDUAL MATCH CARDS */}

                      <div className="comparison-score-grid">
                        {comparisonResults.map((course) => {
                          const isHighlyMatched =
                            recommendedCourse &&
                            String(recommendedCourse.id) ===
                              String(course.id)

                          return (
                            <article
                              className={`comparison-score-card ${
                                isHighlyMatched
                                  ? 'is-highly-matched'
                                  : ''
                              }`}
                              key={course.id}
                            >
                              <div className="comparison-score-card-top">
                                <BookOpen size={20} />

                                <span>{getCourseName(course)}</span>
                              </div>

                              {isHighlyMatched && (
                                <span className="comparison-winner-badge">
                                  <Award size={13} />
                                  HIGHLY MATCHED
                                </span>
                              )}

                              <div className="comparison-score-metrics">
                                <div className="comparison-metric-box">
                                  <span>
                                    <ShieldCheck size={13} />
                                    Skill Match
                                  </span>

                                  <strong>
                                    {course.skillMatch !== null
                                      ? `${course.skillMatch}%`
                                      : 'N/A'}
                                  </strong>
                                </div>

                                <div className="comparison-metric-box">
                                  <span>
                                    <Heart size={13} />
                                    Interest Match
                                  </span>

                                  <strong>
                                    {course.interestMatch !== null
                                      ? `${course.interestMatch}%`
                                      : 'N/A'}
                                  </strong>
                                </div>

                                <div className="comparison-metric-box overall">
                                  <span>
                                    <Target size={13} />
                                    Overall Match
                                  </span>

                                  <strong>
                                    {course.overallMatch !== null
                                      ? `${course.overallMatch}%`
                                      : 'N/A'}
                                  </strong>
                                </div>
                              </div>

                              <div className="comparison-score-track">
                                <div
                                  className="comparison-score-fill"
                                  style={{
                                    width: `${
                                      course.overallMatch ?? 0
                                    }%`,
                                  }}
                                />
                              </div>

                              <p>
                                Based on your existing profile data.
                              </p>
                            </article>
                          )
                        })}
                      </div>

                      {/* WHY HIGHLY MATCHED */}

                      <div className="comparison-why-section">
                        <div className="comparison-analysis-heading">
                          <span className="comparison-label">
                            <Sparkles size={15} />
                            MATCH EXPLANATION
                          </span>

                          <h2>Why Is This Course Highly Matched?</h2>

                          <p>
                            The course with the highest available
                            Overall Match is highlighted below.
                          </p>
                        </div>

                        {recommendedCourse ? (
                          <article className="comparison-why-card">
                            <div className="comparison-why-icon">
                              <Award size={25} />
                            </div>

                            <div className="comparison-why-content">
                              <span className="comparison-winner-tag">
                                HIGHLY MATCHED COURSE
                              </span>

                              <h3>
                                {getCourseName(recommendedCourse)}
                              </h3>

                              <div className="comparison-winner-score">
                                {recommendedCourse.overallMatch}% Overall Match
                              </div>

                              <p>
                                {getWhyMatched(recommendedCourse)}
                              </p>

                              <small>
                                Learnova identifies this course as the
                                highest match among your two selected
                                courses. This is a recommendation, not
                                a compulsory choice.
                              </small>
                            </div>
                          </article>
                        ) : (
                          <div className="comparison-no-recommendation">
                            <AlertCircle size={22} />

                            <div>
                              <strong>
                                Personalized recommendation unavailable
                              </strong>

                              <p>
                                Match scores were not returned for
                                these courses. You can still compare
                                the available course details.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </section>

                {/* ASSESSMENT PERFORMANCE */}

                <section className="comparison-assessment-section">
                  <div className="comparison-analysis-heading">
                    <span className="comparison-label">
                      <BarChart3 size={15} />
                      SKILL ASSESSMENT
                    </span>

                    <h2>Your Assessment Performance</h2>

                    <p>
                      Assessment results are displayed separately.
                      They do not change the Skill, Interest or
                      Overall Match formula.
                    </p>
                  </div>

                  <div className="comparison-assessment-grid">
                    {comparisonResults.map((course) => (
                      <article
                        className="comparison-assessment-card"
                        key={course.id}
                      >
                        <h3>{getCourseName(course)}</h3>

                        <div className="comparison-assessment-summary">
                          <div>
                            <span>Assessment Average</span>

                            <strong>
                              {course.assessment.average !== null
                                ? `${course.assessment.average}%`
                                : 'N/A'}
                            </strong>
                          </div>

                          <div>
                            <span>Skills Assessed</span>

                            <strong>
                              {course.assessment.assessedCount}
                            </strong>
                          </div>
                        </div>

                        {course.assessment.performance.length > 0 ? (
                          <div className="comparison-assessment-list">
                            {course.assessment.performance.map(
                              (item, index) => (
                                <div
                                  className="comparison-assessment-item"
                                  key={item.id || index}
                                >
                                  <span>
                                    {getEvidenceName(item) ||
                                      item.skill ||
                                      `Assessment ${index + 1}`}
                                  </span>

                                  <strong>
                                    {formatValue(
                                      item.score ??
                                      item.percentage ??
                                      item.average_score,
                                      'N/A'
                                    )}
                                    {typeof (
                                      item.score ??
                                      item.percentage ??
                                      item.average_score
                                    ) === 'number'
                                      ? '%'
                                      : ''}
                                  </strong>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="comparison-assessment-empty">
                            <AlertCircle size={15} />
                            No related assessment details available.
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>

                {/* ADVANTAGES AND DISADVANTAGES */}

                <section className="comparison-strengths">
                  <div className="comparison-analysis-heading">
                    <span className="comparison-label">
                      COURSE DETAILS REVIEW
                    </span>

                    <h2>Advantages & Disadvantages</h2>

                    <p>
                      Review the benefits and details to check before
                      making your final decision.
                    </p>
                  </div>

                  <div className="comparison-strength-grid">
                    {comparisonResults.map((course) => (
                      <article
                        className="comparison-strength-card"
                        key={course.id}
                      >
                        <h3>{getCourseName(course)}</h3>

                        <div className="comparison-strength-section">
                          <strong>
                            <CheckCircle2 size={16} />
                            Advantages
                          </strong>

                          {course.advantages.map((item, index) => (
                            <p key={index}>{item}</p>
                          ))}
                        </div>

                        <div className="comparison-strength-section consideration">
                          <strong>
                            <AlertCircle size={16} />
                            Disadvantages / Things to Check
                          </strong>

                          {course.considerations.length ? (
                            course.considerations.map(
                              (item, index) => (
                                <p key={index}>{item}</p>
                              )
                            )
                          ) : (
                            <p>
                              No missing details were identified in
                              the available course information.
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {/* HIGHEST MATCH SUMMARY */}

                <section className="comparison-recommendation">
                  <div className="comparison-recommendation-heading">
                    <span className="comparison-label">
                      <Sparkles size={16} />
                      LEARNOVA RECOMMENDATION
                    </span>

                    <h2>Which Course Matches You Best?</h2>
                  </div>

                  {recommendationsLoading ? (
                    <p>
                      Checking your personalized recommendation scores...
                    </p>
                  ) : recommendedCourse ? (
                    <div className="comparison-winner">
                      <div className="comparison-winner-icon">
                        <Award size={30} />
                      </div>

                      <div className="comparison-winner-content">
                        <span className="comparison-winner-tag">
                          HIGHEST OVERALL MATCH
                        </span>

                        <h3>
                          {getCourseName(recommendedCourse)}
                        </h3>

                        <div className="comparison-winner-score">
                          {recommendedCourse.overallMatch}% Match
                        </div>

                        <p>
                          {getWhyMatched(recommendedCourse)}
                        </p>

                        <small>
                          This is a suggestion based on your available
                          profile information. You make the final decision.
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="comparison-no-recommendation">
                      <AlertCircle size={22} />

                      <div>
                        <strong>
                          Personalized recommendation unavailable
                        </strong>

                        <p>
                          Compare the course details and choose
                          according to your learning preferences.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* STUDENT FINAL DECISION */}

                <section className="comparison-final-decision">
                  <div className="comparison-analysis-heading">
                    <span className="comparison-label">
                      <UserCheck size={16} />
                      YOUR FINAL DECISION
                    </span>

                    <h2>Choose Your Preferred Course</h2>

                    <p>
                      The highest match is a recommendation, not a
                      compulsory choice. You decide which course you
                      want to learn.
                    </p>
                  </div>

                  <div className="comparison-choice-grid">
                    {comparisonResults.map((course) => {
                      const isSelected =
                        String(selectedCourseId) === String(course.id)

                      const isHighestMatch =
                        recommendedCourse &&
                        String(recommendedCourse.id) ===
                          String(course.id)

                      return (
                        <article
                          className={`comparison-choice-card ${
                            isSelected ? 'selected' : ''
                          }`}
                          key={course.id}
                        >
                          {isHighestMatch && (
                            <span className="comparison-winner-badge">
                              <Award size={13} />
                              HIGHLY MATCHED
                            </span>
                          )}

                          <h3>{getCourseName(course)}</h3>

                          <p>
                            {formatValue(course.category, 'General')} ·{' '}
                            {getDuration(course)}
                          </p>

                          <strong className="comparison-choice-match">
                            {course.overallMatch !== null
                              ? `${course.overallMatch}% Overall Match`
                              : 'Match score unavailable'}
                          </strong>

                          <button
                            type="button"
                            onClick={() => handleSelectCourse(course)}
                            className={
                              isSelected
                                ? 'comparison-selected-button'
                                : 'comparison-choose-button'
                            }
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 size={16} />
                                Selected by You
                              </>
                            ) : (
                              'Choose This Course'
                            )}
                          </button>
                        </article>
                      )
                    })}
                  </div>

                  {/* FREE / PAID SELECTION */}

                  {selectedCourse && (
                    <div className="comparison-resource-choice">
                      <div className="comparison-resource-choice-heading">
                        <span className="comparison-label">
                          <CheckCircle2 size={15} />
                          COURSE SELECTED
                        </span>

                        <h3>
                          {getCourseName(selectedCourse)}
                        </h3>

                        <p>
                          Choose how you want to learn this course.
                        </p>
                      </div>

                      <div className="comparison-pricing-options">
                        <button
                          type="button"
                          className={`comparison-pricing-button free ${
                            selectedPricing === 'free' ? 'active' : ''
                          }`}
                          onClick={() => handlePricingSelect('free')}
                        >
                          <span className="comparison-pricing-icon">
                            <BookOpen size={22} />
                          </span>

                          <span>
                            <strong>Free Learning</strong>
                            <small>
                              Explore available free resources
                            </small>
                          </span>

                          <ArrowLeftRight size={17} />
                        </button>

                        <button
                          type="button"
                          className={`comparison-pricing-button paid ${
                            selectedPricing === 'paid' ? 'active' : ''
                          }`}
                          onClick={() => handlePricingSelect('paid')}
                        >
                          <span className="comparison-pricing-icon">
                            <GraduationCap size={22} />
                          </span>

                          <span>
                            <strong>Paid Learning</strong>
                            <small>
                              Explore available paid resources
                            </small>
                          </span>

                          <ArrowLeftRight size={17} />
                        </button>
                      </div>

                      {selectedPricing && (
                        <div className="comparison-selected-resources">
                          <h4>
                            {selectedPricing === 'free'
                              ? 'Available Free Resources'
                              : 'Available Paid Resources'}
                          </h4>

                          {selectedResources.length > 0 ? (
                            <div className="comparison-selected-resource-list">
                              {selectedResources.map(
                                (resource, index) => (
                                  <div
                                    className="comparison-selected-resource"
                                    key={
                                      resource.id ||
                                      `${resource.title}-${index}`
                                    }
                                  >
                                    <div>
                                      <strong>
                                        {getResourceTitle(resource)}
                                      </strong>

                                      <span>
                                        {formatValue(
                                          resource.description,
                                          selectedPricing === 'free'
                                            ? 'Free learning resource'
                                            : 'Paid learning resource'
                                        )}
                                      </span>
                                    </div>

                                    {resource.external_url ? (
                                      <button
                                        type="button"
                                        className="comparison-external-resource-link"
                                        onClick={() =>
                                          handleOpenResource(resource)
                                        }
                                      >
                                        Open Resource
                                        <ExternalLink size={14} />
                                      </button>
                                    ) : (
                                      <span className="comparison-resource-unavailable">
                                        Link unavailable
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="comparison-resource-unavailable">
                              <AlertCircle size={17} />

                              <span>
                                No {selectedPricing} learning resources
                                are currently available for this course.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {decisionMessage && (
                    <div className="comparison-decision-result">
                      <CheckCircle2 size={21} />

                      <div>
                        <strong>Your course decision</strong>
                        <p>{decisionMessage}</p>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ADD MORE */}

            {courses.length < MAX_COMPARE_COURSES && (
              <div className="comparison-add-more">
                <BookOpen size={20} />

                <div>
                  <strong>
                    Want to compare another course?
                  </strong>

                  <p>
                    You can compare up to 2 courses at a time.
                  </p>
                </div>

                <Link to="/student/courses">
                  Add Courses
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default CourseComparison