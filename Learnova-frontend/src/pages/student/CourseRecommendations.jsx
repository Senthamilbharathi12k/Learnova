
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  GraduationCap,
  ArrowUpRight,
  SlidersHorizontal,
  Target,
  CheckCircle2,
  RefreshCw,
  Monitor,
  IndianRupee,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getCourseRecommendations,
  getStudentSkills,
  getStudentInterests,
} from '../../services/courseService'

import './CourseRecommendations.css'

const normalize = (value) =>
  String(value ?? '').trim().toLowerCase()
const getList = (data, keys = []) => {
  if (Array.isArray(data)) return data

  if (data && typeof data === 'object') {
    for (const key of keys) {
      if (Array.isArray(data[key])) return data[key]
    }
  }

  return []
}
const getErrorMessage = (error) => {
  const data = error?.response?.data

  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.message === 'string') return data.message

  if (data && typeof data === 'object') {
    const firstError = Object.values(data)
      .flat()
      .find((value) => typeof value === 'string')

    if (firstError) return firstError
  }

  return 'Unable to load course recommendations. Please try again.'
}
const formatLevel = (value) => {
  if (!value) return 'Not specified'
  const text = String(value).trim().toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
const formatDuration = (course) => {
  if (course.duration_weeks) {
    return `${course.duration_weeks} Weeks`
  }
  if (course.duration) return course.duration
  return 'Flexible Duration'
}
const formatMatchScore = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const score = Number(value)
  if (!Number.isFinite(score)) return null
  return Math.min(100, Math.max(0, Math.round(score)))
}
const getItemName = (item, nestedKey) => {
  if (typeof item === 'string') return item

  return (
    item?.[nestedKey]?.name ||
    item?.name ||
    item?.title ||
    'Unknown'
  )
}
const formatCourse = (course) => {
  const pricing = String(
    course.pricing_type || course.pricing || ''
  ).toUpperCase()
  const learningMode = String(
    course.learning_mode || course.mode || ''
  ).toUpperCase()
  const rawPrice = course.price ?? course.course_price
  let pricingLabel = ''
  if (pricing === 'FREE' || pricing === 'PAID') {
    pricingLabel = pricing === 'FREE' ? 'Free' : 'Paid'
  } else if (rawPrice !== undefined && rawPrice !== null) {
    pricingLabel = Number(rawPrice) === 0 ? 'Free' : 'Paid'
  }
  let learningModeLabel = ''
  if (learningMode === 'ONLINE' || learningMode === 'OFFLINE') {
    learningModeLabel =
      learningMode.charAt(0) + learningMode.slice(1).toLowerCase()
  }
  return {
    id: course.id,
    title: course.name || course.title || 'Untitled Course',
    category: course.category || 'General',
    level: formatLevel(course.difficulty_level || course.level),
    duration: formatDuration(course),
    description:
      course.description || 'Explore this course to learn more.',
    matchScore: formatMatchScore(
      course.match_percentage ?? course.match_score
    ),
    matchedSkills: Array.isArray(course.matched_skills)
      ? course.matched_skills.map((item) =>
          getItemName(item, 'skill_details')
        )
      : [],
    matchedInterests: Array.isArray(course.matched_interests)
      ? course.matched_interests.map((item) =>
          getItemName(item, 'interest_details')
        )
      : [],
    pricingLabel,
    learningModeLabel,
    price: rawPrice,
  }
}

const fetchRecommendationData = async () => {
  const recommendationData = await getCourseRecommendations()

  const courseList = getList(recommendationData, [
    'recommendations',
    'results',
    'courses',
  ])

  const [skillResult, interestResult] = await Promise.allSettled([
    getStudentSkills(),
    getStudentInterests(),
  ])

  const skills =
    skillResult.status === 'fulfilled'
      ? getList(skillResult.value, [
          'results',
          'skills',
          'student_skills',
        ]).map((item) => ({
          id: item.id,
          name: getItemName(item, 'skill_details'),
          proficiency: item.proficiency || '',
        }))
      : []

  const interests =
    interestResult.status === 'fulfilled'
      ? getList(interestResult.value, [
          'results',
          'interests',
          'student_interests',
        ]).map((item) => ({
          id: item.id,
          name: getItemName(item, 'interest_details'),
        }))
      : []

  return {
    recommendations: courseList.map(formatCourse),
    recommendationMessage: recommendationData?.message || '',
    studentSkills: skills,
    studentInterests: interests,
  }
}

function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [studentSkills, setStudentSkills] = useState([])
  const [studentInterests, setStudentInterests] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('match')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recommendationMessage, setRecommendationMessage] = useState('')

  const loadRecommendations = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchRecommendationData()

      setRecommendations(data.recommendations)
      setRecommendationMessage(data.recommendationMessage)
      setStudentSkills(data.studentSkills)
      setStudentInterests(data.studentInterests)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setRecommendations([])
      setRecommendationMessage('')
      setStudentSkills([])
      setStudentInterests([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Retry handler
  const handleRetry = () => {
    loadRecommendations()
  }

  // Initial page data loading
  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        const data = await fetchRecommendationData()

        if (!isMounted) return

        setRecommendations(data.recommendations)
        setRecommendationMessage(data.recommendationMessage)
        setStudentSkills(data.studentSkills)
        setStudentInterests(data.studentInterests)
        setError('')
      } catch (requestError) {
        if (!isMounted) return

        setError(getErrorMessage(requestError))
        setRecommendations([])
        setRecommendationMessage('')
        setStudentSkills([])
        setStudentInterests([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchInitialData()

    return () => {
      isMounted = false
    }
  }, [])





  const categories = useMemo(
    () => [
      'All',
      ...new Set(
        recommendations
          .map((course) => course.category)
          .filter(Boolean)
      ),
    ],
    [recommendations]
  )

  const filteredCourses = useMemo(() => {
    const search = normalize(searchTerm)

    const result = recommendations.filter((course) => {
      const matchesSearch =
        normalize(course.title).includes(search) ||
        normalize(course.category).includes(search) ||
        normalize(course.description).includes(search)

      const matchesCategory =
        selectedCategory === 'All' ||
        course.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    return [...result].sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchScore ?? -1) - (a.matchScore ?? -1)
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })
  }, [recommendations, searchTerm, selectedCategory, sortBy])
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSortBy('match')
  }
  if (loading) {
    return (
      <main className="recommendations-page">
        <div className="recommendations-container">
          <div className="recommendations-loading">
            <BookOpen size={32} />
           <p>Loading your course recommendations...</p>
          </div>
        </div>
      </main>
    )
  }
  if (error) {
    return (
      <main className="recommendations-page">
        <div className="recommendations-container">
          <div className="recommendations-error">
            <div className="recommendations-error-icon">
              <BookOpen size={30} />
            </div>
            <h2>Unable to Load Recommendations</h2>
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main className="recommendations-page">
      <section className="recommendations-hero">
        <motion.div
          className="recommendations-hero-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="recommendations-eyebrow">
            <Sparkles size={16} />
            PERSONALIZED LEARNING
          </span>

          <h1>
            Courses Recommended
            <span> For Your Growth</span>
          </h1>

          <p>
            Discover learning opportunities based on your skills
            and interests. Take the next step towards your career goals.
          </p>

          <Link
            to="/student/skills"
            className="recommendations-edit-link"
          >
            <Target size={17} />
            Update Skills & Interests
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </section>

      <section className="recommendations-container">
        <div className="recommendations-section-heading">
          <div>
            <span className="recommendations-label">
              YOUR LEARNING PATH
            </span>
            <h2>Recommended Courses</h2>
            <p>
              Explore courses selected using rule-based matching.
            </p>
          </div>

          <div className="recommendations-count">
            <BookOpen size={19} />
            <span>{filteredCourses.length} Courses</span>
          </div>
        </div>

        <div className="recommendations-profile">
          <div className="recommendations-profile-item">
            <div className="recommendations-profile-icon">
              <GraduationCap size={21} />
            </div>
            <div>
              <strong>Your Skills</strong>
              <p>
                {studentSkills.length
                  ? studentSkills.map((skill) => skill.name).join(', ')
                  : 'No skills added'}
              </p>
            </div>
          </div>

          <div className="recommendations-profile-item">
            <div className="recommendations-profile-icon">
              <Target size={21} />
            </div>
            <div>
              <strong>Your Interests</strong>
              <p>
                {studentInterests.length
                  ? studentInterests
                      .map((interest) => interest.name)
                      .join(', ')
                  : 'No interests added'}
              </p>
            </div>
          </div>
        </div>

        <div className="recommendations-match-summary">
          <CheckCircle2 size={18} />
          <span>
            {recommendations.length} recommended courses found.
            Results are generated by your rule-based recommendation system.
          </span>
        </div>

        {recommendations.length > 0 ? (
          <>
            <div className="recommendations-toolbar">
              <div className="recommendations-search">
                <Search size={19} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search courses"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="recommendations-clear-search"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="recommendations-filter">
                <SlidersHorizontal size={18} />
                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  aria-label="Filter by category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                className="recommendations-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort courses"
              >
                <option value="match">Best Match</option>
                <option value="name">Course Name</option>
              </select>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="recommendations-grid">
                {filteredCourses.map((course, index) => (
                  <motion.article
                    className="recommendation-card matched-course"
                    key={course.id ?? `${course.title}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.04,
                    }}
                  >
                    <div className="recommendation-card-top">
                      <span className="recommendation-category">
                        {course.category}
                      </span>

                      {course.matchScore !== null && (
                        <span className="recommendation-match">
                          <Sparkles size={13} />
                          Match · {course.matchScore}%
                        </span>
                      )}
                    </div>

                    <div className="recommendation-card-icon">
                      <BookOpen size={21} />
                    </div>

                    <h3>{course.title}</h3>

                    <p className="recommendation-description">
                      {course.description}
                    </p>

                    <div className="recommendation-meta">
                      <span>
                        <GraduationCap size={15} />
                        {course.level}
                      </span>
                      <span>
                        <Clock size={15} />
                        {course.duration}
                      </span>
                    </div>

                    {(course.pricingLabel ||
                      course.learningModeLabel) && (
                      <div className="recommendation-course-details">
                        {course.pricingLabel && (
                          <span>
                            <IndianRupee size={14} />
                            {course.pricingLabel}
                            {course.price !== undefined &&
                              course.price !== null &&
                              course.pricingLabel === 'Paid' &&
                              ` · ${course.price}`}
                          </span>
                        )}

                        {course.learningModeLabel && (
                          <span>
                            <Monitor size={14} />
                            {course.learningModeLabel}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="recommendation-match-details">
                      <strong>Why this course matches</strong>

                      {course.matchedSkills.length > 0 && (
                        <p>
                          Skills: {course.matchedSkills.join(', ')}
                        </p>
                      )}

                      {course.matchedInterests.length > 0 && (
                        <p>
                          Interests: {course.matchedInterests.join(', ')}
                        </p>
                      )}

                      {course.matchedSkills.length === 0 &&
                        course.matchedInterests.length === 0 && (
                          <p>
                            Selected by the recommendation rules based on
                            your profile.
                          </p>
                        )}
                    </div>

                    <Link
                      to="/student/courses"
                      className="recommendation-view-button"
                    >
                      View in Course Discovery
                      <ArrowUpRight size={16} />
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="recommendations-empty">
                <BookOpen size={38} />
                <h3>No courses found</h3>
                <p>
                  Try another search term or choose a different category.
                </p>
                <button type="button" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="recommendations-empty">
            <BookOpen size={38} />
            <h3>No Recommendations Yet</h3>
            <p>
              {recommendationMessage ||
                'Add skills and interests to receive personalized course recommendations.'}
            </p>
            <Link
              to="/student/skills"
              className="recommendations-edit-link"
            >
              Add Skills & Interests
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default CourseRecommendations
