
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  Search,
  BookOpen,
  Clock,
  Monitor,
  MapPin,
  IndianRupee,
  SlidersHorizontal,
  GraduationCap,
  X,
  LoaderCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Bookmark,
  ArrowLeftRight,
} from 'lucide-react'

import { getCourseDiscovery } from '../../services/courseService'

import {
  getSavedCourses,
  saveCourse,
  removeSavedCourse,
  subscribeSavedCourses,
} from '../../services/savedCourseService'

import {
  getComparisonCourses,
  addCourseToComparison,
  subscribeComparisonCourses,
  MAX_COMPARE_COURSES,
} from '../../services/courseComparisonService'

import './CourseDiscovery.css'

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getCourseList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.courses)) return data.courses
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data

  return []
}

const getCourseName = (course) =>
  course?.name || course?.title || 'Untitled Course'

const formatLevel = (level) => {
  if (!level) return 'Not specified'

  const value = String(level).toLowerCase()

  return value.charAt(0).toUpperCase() + value.slice(1)
}

const formatDuration = (weeks) => {
  const duration = Number(weeks)

  if (!Number.isFinite(duration) || duration <= 0) {
    return 'Duration not specified'
  }

  return duration === 1 ? '1 Week' : `${duration} Weeks`
}

const formatPrice = (resource) => {
  const price = resource?.price

  if (price === null || price === undefined || price === '') {
    return 'Price varies'
  }

  const currency = resource.currency || 'INR'

  if (currency.toUpperCase() === 'INR') {
    return `₹${price}`
  }

  return `${currency} ${price}`
}

const getCourseResources = (course) => {
  if (Array.isArray(course?.resources)) {
    return course.resources
  }

  if (Array.isArray(course?.filtered_resources)) {
    return course.filtered_resources
  }

  return []
}

const getErrorMessage = (error) => {
  const data = error?.response?.data

  if (typeof data?.message === 'string') {
    return data.message
  }

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data === 'string') {
    return data
  }

  return 'Unable to load courses. Please try again.'
}

const getSavedCourseList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.saved_courses)) return data.saved_courses

  return []
}

// ==========================================
// COURSE DISCOVERY COMPONENT
// ==========================================

function CourseDiscovery() {
  const [courses, setCourses] = useState([])

  // FILTER STATES

  const [searchTerm, setSearchTerm] = useState('')
  const [courseType, setCourseType] = useState('All')
  const [priceType, setPriceType] = useState('All')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')

  const [categoryOptions, setCategoryOptions] = useState(['All'])

  // API STATES

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // SAVED COURSE STATES

  const [savedIds, setSavedIds] = useState(new Set())
  const [savedLoading, setSavedLoading] = useState(false)

  // COMPARISON STATES

  const [comparisonIds, setComparisonIds] = useState(() => {
    return new Set(
      getComparisonCourses().map((course) => String(course.id))
    )
  })

  const [actionMessage, setActionMessage] = useState({
    type: '',
    text: '',
  })

  // ========================================
  // LOAD COURSES
  // ========================================

  const loadCourses = useCallback(async (filters = {}) => {
    setLoading(true)
    setError('')

    try {
      const data = await getCourseDiscovery(filters)
      const courseList = getCourseList(data)

      setCourses(courseList)

      const categories = [
        ...new Set(
          courseList
            .map((course) => course.category)
            .filter(
              (item) =>
                typeof item === 'string' &&
                item.trim() !== ''
            )
        ),
      ].sort((a, b) => a.localeCompare(b))

      setCategoryOptions(['All', ...categories])
    } catch (err) {
      console.error('Course discovery error:', err)

      setError(getErrorMessage(err))
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  // INITIAL API CALL

 // INITIAL API CALL

useEffect(() => {
  let isMounted = true

  const fetchInitialCourses = async () => {
    if (!isMounted) return
    await loadCourses()
  }

  fetchInitialCourses()

  return () => {
    isMounted = false
  }
}, [loadCourses])

  // ========================================
  // LOAD SAVED COURSES
  // ========================================

  const updateSavedIds = useCallback(async () => {
    try {
      const response = await getSavedCourses()
      const saved = getSavedCourseList(response)

      setSavedIds(
        new Set(
          saved.map((course) => String(course.id))
        )
      )
    } catch (err) {
      console.error('Unable to load saved courses:', err)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const syncSavedCourses = async () => {
      try {
        const response = await getSavedCourses()
        const saved = getSavedCourseList(response)

        if (isMounted) {
          setSavedIds(
            new Set(
              saved.map((course) => String(course.id))
            )
          )
        }
      } catch (err) {
        console.error('Saved courses loading error:', err)
      }
    }

    syncSavedCourses()

    const unsubscribe = subscribeSavedCourses(() => {
      if (isMounted) {
        updateSavedIds()
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [updateSavedIds])

  // ========================================
  // SYNC COMPARISON COURSES
  // ========================================

  useEffect(() => {
    const updateComparisonIds = () => {
      const comparisonCourses = getComparisonCourses()

      setComparisonIds(
        new Set(
          comparisonCourses.map((course) => String(course.id))
        )
      )
    }

    updateComparisonIds()

    return subscribeComparisonCourses(updateComparisonIds)
  }, [])

  // ========================================
  // SAVE / UNSAVE COURSE
  // ========================================

  const handleSaveCourse = async (course) => {
    if (course.id === null || course.id === undefined) {
      setActionMessage({
        type: 'error',
        text: 'This course cannot be saved because its ID is missing.',
      })
      return
    }

    if (savedLoading) return

    setSavedLoading(true)

    try {
      const alreadySaved = savedIds.has(String(course.id))
      const courseName = getCourseName(course)

      if (alreadySaved) {
        await removeSavedCourse(course.id)

        setSavedIds((previous) => {
          const updated = new Set(previous)
          updated.delete(String(course.id))
          return updated
        })

        setActionMessage({
          type: 'success',
          text: `${courseName} removed from saved courses.`,
        })
      } else {
        await saveCourse(course)

        setSavedIds((previous) => {
          const updated = new Set(previous)
          updated.add(String(course.id))
          return updated
        })

        setActionMessage({
          type: 'success',
          text: `${courseName} added to saved courses.`,
        })
      }
    } catch (err) {
      console.error('Save course error:', err)

      setActionMessage({
        type: 'error',
        text: getErrorMessage(err),
      })

      await updateSavedIds()
    } finally {
      setSavedLoading(false)
    }
  }

  // ========================================
  // ADD COURSE TO COMPARISON
  // MAXIMUM TWO COURSES
  // ========================================

  const handleCompareCourse = (course) => {
    if (course.id === null || course.id === undefined) {
      setActionMessage({
        type: 'error',
        text: 'This course cannot be compared because its ID is missing.',
      })
      return
    }

    try {
      const result = addCourseToComparison(course)
      const courseName = getCourseName(course)

      if (result.status === 'limit-reached') {
        setActionMessage({
          type: 'error',
          text: `You can compare only ${MAX_COMPARE_COURSES} courses at a time. Remove a course from comparison to add another.`,
        })
        return
      }

      if (result.status === 'already-added') {
        setActionMessage({
          type: 'info',
          text: 'This course is already in your comparison list.',
        })
        return
      }

      setActionMessage({
        type: 'success',
        text: `${courseName} added to comparison successfully.`,
      })
    } catch (err) {
      console.error('Course comparison error:', err)

      setActionMessage({
        type: 'error',
        text: 'Unable to add this course to comparison.',
      })
    }
  }

  // ========================================
  // APPLY FILTERS
  // ========================================

  const applyFilters = () => {
    loadCourses({
      search: searchTerm,
      category,
      learningMode: courseType,
      pricingType: priceType,
    })
  }

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearchTerm('')
    setCourseType('All')
    setPriceType('All')
    setCategory('All')
    setSortBy('name')

    loadCourses()
  }

  // ========================================
  // ACTIVE FILTER COUNT
  // ========================================

  const activeFilterCount = [
    searchTerm.trim() !== '',
    courseType !== 'All',
    priceType !== 'All',
    category !== 'All',
  ].filter(Boolean).length

  // ========================================
  // SORT COURSES
  // ========================================

  const filteredCourses = useMemo(() => {
    const result = [...courses]

    if (sortBy === 'name') {
      result.sort((a, b) =>
        String(getCourseName(a)).localeCompare(
          String(getCourseName(b))
        )
      )
    }

    if (sortBy === 'duration') {
      result.sort((a, b) => {
        const durationA = Number(a.duration_weeks) || 0
        const durationB = Number(b.duration_weeks) || 0

        return durationA - durationB
      })
    }

    return result
  }, [courses, sortBy])

  // ========================================
  // RESOURCE RENDERING
  // ========================================

  const renderResource = (resource, index) => {
    const pricingType = String(
      resource?.pricing_type || ''
    ).toUpperCase()

    const isFree = pricingType === 'FREE'
    const isPaid = pricingType === 'PAID'

    const hasPrice =
      resource?.price !== null &&
      resource?.price !== undefined &&
      resource?.price !== ''

    const resourceTitle =
      resource?.title || 'Learning Resource'

    const priceLabel = isFree
      ? 'Free Access'
      : hasPrice
        ? formatPrice(resource)
        : 'Price varies'

    return (
      <div
        className="discovery-resource"
        key={resource.id || `${resourceTitle}-${index}`}
      >
        <div className="discovery-resource-header">
          <span
            className={`discovery-resource-badge ${
              isFree
                ? 'free-price'
                : isPaid
                  ? 'paid-price'
                  : 'unknown-price'
            }`}
          >
            {isFree
              ? 'FREE'
              : isPaid
                ? 'PAID'
                : 'PRICE NOT SPECIFIED'}
          </span>

          <span className="discovery-resource-price">
            {priceLabel}
          </span>
        </div>

        <h4>{resourceTitle}</h4>

        {resource.provider && (
          <p className="discovery-resource-provider">
            Provider: <strong>{resource.provider}</strong>
          </p>
        )}

        {resource.description && (
          <p className="discovery-resource-description">
            {resource.description}
          </p>
        )}

        {resource.external_url ? (
          <a
            className="discovery-course-button"
            href={resource.external_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Resource
            <ExternalLink size={15} />
          </a>
        ) : (
          <span className="discovery-resource-unavailable">
            Resource link unavailable
          </span>
        )}
      </div>
    )
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="course-discovery-page">

      {/* HERO SECTION */}

      <section className="course-discovery-hero">
        <motion.div
          className="course-discovery-hero-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="course-discovery-eyebrow">
            <GraduationCap size={17} />
            EXPLORE LEARNING
          </span>

          <h1>
            Discover Courses.
            <span>Shape Your Future.</span>
          </h1>

          <p>
            Find learning opportunities that match your
            interests, schedule and budget. Choose online
            or offline and free or paid learning resources.
          </p>
        </motion.div>
      </section>

      {/* COURSE SECTION */}

      <section className="course-discovery-container">

        <div className="course-discovery-heading">
          <div>
            <span className="course-discovery-label">
              COURSE LIBRARY
            </span>

            <h2>Explore All Courses</h2>

            <p>
              Choose the learning format and resources
              that work for you.
            </p>
          </div>

          <div className="course-discovery-heading-actions">

            <div className="course-result-count">
              <BookOpen size={19} />
              {filteredCourses.length} Courses Found
            </div>

            <Link
              to="/student/saved-courses"
              className="course-saved-link"
            >
              <Bookmark size={17} />
              Saved Courses
              <span>{savedIds.size}</span>
            </Link>

            <Link
              to="/student/course-comparison"
              className="course-compare-link"
            >
              <ArrowLeftRight size={17} />
              Compare Courses
              <span>
                {comparisonIds.size}/{MAX_COMPARE_COURSES}
              </span>
            </Link>

          </div>
        </div>

        {/* ACTION MESSAGE */}

        {actionMessage.text && (
          <div
            className={`course-comparison-message ${actionMessage.type}`}
            role="status"
          >
            <span>{actionMessage.text}</span>

            <button
              type="button"
              onClick={() =>
                setActionMessage({
                  type: '',
                  text: '',
                })
              }
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* FILTER PANEL */}

        <div className="course-filter-panel">

          <div className="course-search-box">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search by course name..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters()
                }
              }}
            />

            {searchTerm && (
              <button
                type="button"
                className="course-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="course-filter-grid">

            <label className="course-filter-control">
              <span>
                <Monitor size={17} />
                Course Type
              </span>

              <select
                value={courseType}
                onChange={(event) =>
                  setCourseType(event.target.value)
                }
              >
                <option value="All">All Types</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </label>

            <label className="course-filter-control">
              <span>
                <IndianRupee size={17} />
                Resource Price
              </span>

              <select
                value={priceType}
                onChange={(event) =>
                  setPriceType(event.target.value)
                }
              >
                <option value="All">All Prices</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </label>

            <label className="course-filter-control">
              <span>
                <SlidersHorizontal size={17} />
                Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === 'All'
                      ? 'All Categories'
                      : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="course-filter-control">
              <span>
                <BookOpen size={17} />
                Sort By
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="name">Course Name</option>
                <option value="duration">Duration</option>
              </select>
            </label>

          </div>

          <div className="course-filter-footer">
            <span>
              {activeFilterCount > 0
                ? `${activeFilterCount} filter(s) selected`
                : 'Showing all matching course options'}
            </span>

            <div className="course-filter-actions">

              <button
                type="button"
                onClick={applyFilters}
                disabled={loading}
              >
                <Search size={15} />
                Apply Filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                disabled={loading}
              >
                <X size={15} />
                Clear Filters
              </button>

            </div>
          </div>
        </div>

        {/* COURSE RESULTS */}

        <div className="course-discovery-results">

          {loading ? (

            <div className="course-discovery-loading">
              <LoaderCircle
                size={36}
                className="course-loading-icon"
              />

              <h3>Loading Courses...</h3>

              <p>
                Fetching available courses from Learnova.
              </p>
            </div>

          ) : error ? (

            <div className="course-discovery-empty">
              <AlertCircle size={40} />

              <h3>Unable to Load Courses</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  loadCourses({
                    search: searchTerm,
                    category,
                    learningMode: courseType,
                    pricingType: priceType,
                  })
                }
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>

          ) : filteredCourses.length > 0 ? (

            <div className="course-discovery-grid">

              {filteredCourses.map((course, index) => {
                const learningMode = String(
                  course.learning_mode || ''
                ).toUpperCase()

                const isOnline = learningMode === 'ONLINE'

                const resources = getCourseResources(course)

                const courseName = getCourseName(course)

                const courseIsSaved =
                  savedIds.has(String(course.id))

                const courseIsInComparison =
                  comparisonIds.has(String(course.id))

                // STRICT MAXIMUM: TWO COURSES

                const comparisonLimitReached =
                  comparisonIds.size >= MAX_COMPARE_COURSES &&
                  !courseIsInComparison

                return (
                  <motion.article
                    className="discovery-course-card"
                    key={course.id || `${courseName}-${index}`}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(index * 0.04, 0.2),
                    }}
                  >

                    <div className="discovery-card-top">

                      <span className="discovery-category">
                        {course.category || 'General'}
                      </span>

                      <div className="discovery-card-actions">

                        {/* SAVE COURSE */}

                        <button
                          type="button"
                          className={`discovery-save-button ${
                            courseIsSaved ? 'is-saved' : ''
                          }`}
                          onClick={() => handleSaveCourse(course)}
                          disabled={savedLoading}
                          aria-pressed={courseIsSaved}
                          aria-label={
                            courseIsSaved
                              ? `Remove ${courseName} from saved courses`
                              : `Save ${courseName}`
                          }
                        >
                          <Bookmark
                            size={15}
                            fill={
                              courseIsSaved
                                ? 'currentColor'
                                : 'none'
                            }
                          />

                          {courseIsSaved ? 'Saved' : 'Save Course'}
                        </button>

                        {/* COMPARE COURSE */}

                        <button
                          type="button"
                          className={`discovery-compare-button ${
                            courseIsInComparison ? 'is-selected' : ''
                          }`}
                          onClick={() => handleCompareCourse(course)}
                          disabled={
                            comparisonLimitReached ||
                            courseIsInComparison
                          }
                          aria-pressed={courseIsInComparison}
                          title={
                            comparisonLimitReached
                              ? 'Remove a course from comparison to add another'
                              : 'Add this course to comparison'
                          }
                        >
                          <ArrowLeftRight size={14} />

                          {courseIsInComparison
                            ? 'Added'
                            : comparisonLimitReached
                              ? 'Limit Reached'
                              : 'Compare'}
                        </button>

                      </div>
                    </div>

                    <div className="discovery-course-icon">
                      <BookOpen size={25} />
                    </div>

                    <h3>{courseName}</h3>

                    <p className="discovery-course-description">
                      {course.description ||
                        'Course description is not available.'}
                    </p>

                    <div className="discovery-course-info">

                      <span>
                        {isOnline ? (
                          <Monitor size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}

                        {learningMode
                          ? formatLevel(learningMode)
                          : 'Mode not specified'}
                      </span>

                      <span>
                        <Clock size={16} />
                        {formatDuration(course.duration_weeks)}
                      </span>

                    </div>

                    <div className="discovery-course-level">
                      <GraduationCap size={16} />

                      Level: {formatLevel(course.difficulty_level)}
                    </div>

                    {/* LEARNING RESOURCES */}

                    <div className="discovery-resources-section">

                      <div className="discovery-resources-heading">
                        <h4>Available Learning Resources</h4>

                        <span>
                          {resources.length} Available
                        </span>
                      </div>

                      {resources.length > 0 ? (

                        <div className="discovery-resources-list">
                          {resources.map((resource, resourceIndex) =>
                            renderResource(resource, resourceIndex)
                          )}
                        </div>

                      ) : (

                        <div className="discovery-no-resources">
                          <BookOpen size={19} />

                          <p>
                            No learning resources are currently
                            available for this course.
                          </p>
                        </div>

                      )}

                    </div>

                  </motion.article>
                )
              })}

            </div>

          ) : (

            <div className="course-discovery-empty">
              <BookOpen size={40} />

              <h3>No Courses Found</h3>

              <p>
                Try changing your search or filters to
                see more courses.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>

          )}

        </div>
      </section>
    </main>
  )
}

export default CourseDiscovery
