
import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  getCourseRecommendations,
  getStudentSkills,
  getStudentInterests,
} from '../../services/courseService'

import './CourseRecommendations.css'

const normalize = (value) =>
  String(value || '').trim().toLowerCase()

const formatLevel = (value) => {
  if (!value) return 'Not specified'

  return value.charAt(0) + value.slice(1).toLowerCase()
}

const getErrorMessage = (error) => {
  const data = error?.response?.data

  if (data?.detail) return data.detail
  if (data?.message) return data.message

  if (data && typeof data === 'object') {
    const firstError = Object.values(data).flat()[0]
    if (typeof firstError === 'string') return firstError
  }

  return 'Unable to load course recommendations. Please try again.'
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

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        recommendationData,
        skillData,
        interestData,
      ] = await Promise.all([
        getCourseRecommendations(),
        getStudentSkills(),
        getStudentInterests(),
      ])

      const courseList = recommendationData.recommendations || []

      const formattedCourses = courseList.map((course) => ({
        id: course.id,
        title: course.name,
        category: course.category,
        level: formatLevel(course.difficulty_level),
        duration: `${course.duration_weeks} Weeks`,
        description: course.description,
        matchScore: course.match_percentage,
        matchedSkills: course.matched_skills || [],
        matchedInterests: course.matched_interests || [],
        isMatched: true,
      }))

      setRecommendations(formattedCourses)

      setStudentSkills(
        skillData.map((item) => ({
          id: item.id,
          name: item.skill_details?.name || 'Unknown Skill',
          proficiency: item.proficiency,
        }))
      )

      setStudentInterests(
        interestData.map((item) => ({
          id: item.id,
          name: item.interest_details?.name || 'Unknown Interest',
        }))
      )

      setRecommendationMessage(recommendationData.message || '')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(
    () => [
      'All',
      ...new Set(recommendations.map((course) => course.category)),
    ],
    [recommendations]
  )

  const filteredCourses = useMemo(() => {
    let result = recommendations.filter((course) => {
      const search = normalize(searchTerm)

      const matchesSearch =
        normalize(course.title).includes(search) ||
        normalize(course.category).includes(search) ||
        normalize(course.description).includes(search)

      const matchesCategory =
        selectedCategory === 'All' ||
        course.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    result = [...result].sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore
      }

      if (sortBy === 'name') {
        return a.title.localeCompare(b.title)
      }

      return 0
    })

    return result
  }, [recommendations, searchTerm, selectedCategory, sortBy])

  const matchedCount = recommendations.length

  if (loading) {
    return (
      <main className="recommendations-page">
        <div className="recommendations-container">
          <div className="recommendations-loading">
            <BookOpen size={30} />
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
            <h2>Unable to Load Recommendations</h2>
            <p>{error}</p>
            <button type="button" onClick={loadRecommendations}>
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
            <Sparkles size={16} /> PERSONALIZED LEARNING
          </span>

          <h1>
            Courses Recommended
            <span> For Your Growth</span>
          </h1>

          <p>
            Discover learning opportunities based on your actual skills
            and interests. Take the next step towards your career goals.
          </p>

          <Link to="/student/skills" className="recommendations-edit-link">
            <Target size={17} />
            Update Skills & Interests
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </section>

      <section className="recommendations-container">
        <div className="recommendations-section-heading">
          <div>
            <span className="recommendations-label">YOUR LEARNING PATH</span>
            <h2>Recommended Courses</h2>
            <p>
              Courses are matched using your skills (70%) and interests (30%).
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
                  ? studentSkills
                      .map((skill) => skill.name)
                      .join(', ')
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
            {matchedCount} courses match your skills or interests.
            Recommendations are generated using rule-based matching.
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
                />
              </div>

              <div className="recommendations-filter">
                <SlidersHorizontal size={18} />
                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
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
                    key={course.id}
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

                      <span className="recommendation-match">
                        <Sparkles size={13} />
                        Best Match · {course.matchScore}%
                      </span>
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
                <p>Try another search term or choose a different category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('All')
                  }}
                >
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
            <Link to="/student/skills" className="recommendations-edit-link">
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
