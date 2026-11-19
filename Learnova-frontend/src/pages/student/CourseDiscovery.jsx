
import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'

import { getCourseDiscovery } from '../../services/courseService'
import './CourseDiscovery.css'

function CourseDiscovery() {
  const [courses, setCourses] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [courseType, setCourseType] = useState('All')
  const [priceType, setPriceType] = useState('All')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')

  const [categoryOptions, setCategoryOptions] = useState(['All'])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load courses from backend
  const loadCourses = async (filters = {}) => {
    setLoading(true)
    setError('')

    try {
      const data = await getCourseDiscovery(filters)

      const courseList = Array.isArray(data)
        ? data
        : Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data?.results)
            ? data.results
            : []

      setCourses(courseList)

      const hasActiveFilters =
        Boolean(filters.search?.trim()) ||
        (filters.category && filters.category !== 'All') ||
        (filters.learningMode && filters.learningMode !== 'All') ||
        (filters.pricingType && filters.pricingType !== 'All')

      if (!hasActiveFilters) {
        const categories = [
          ...new Set(
            courseList
              .map((course) => course.category)
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b))

        setCategoryOptions(['All', ...categories])
      }
    } catch (err) {
      console.error('Course discovery error:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load courses. Please try again.'
      )

      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Initial API call
  useEffect(() => {
    loadCourses()
  }, [])

  // Get resources from the backend response.
  // Supports either "resources" or "filtered_resources".
  const getCourseResources = (course) => {
    if (Array.isArray(course.resources)) {
      return course.resources
    }

    if (Array.isArray(course.filtered_resources)) {
      return course.filtered_resources
    }

    return []
  }

  // Sort courses
  const filteredCourses = useMemo(() => {
    const result = [...courses]

    if (sortBy === 'name') {
      result.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      )
    } else if (sortBy === 'duration') {
      result.sort(
        (a, b) =>
          (Number(a.duration_weeks) || 0) -
          (Number(b.duration_weeks) || 0)
      )
    }

    return result
  }, [courses, sortBy])

  // Apply backend filters
  const applyFilters = () => {
    loadCourses({
      search: searchTerm,
      category,
      learningMode: courseType,
      pricingType: priceType,
    })
  }

  // Reset filters
  const clearFilters = () => {
    setSearchTerm('')
    setCourseType('All')
    setPriceType('All')
    setCategory('All')
    setSortBy('name')

    loadCourses()
  }

  const activeFilterCount = [
    searchTerm.trim() !== '',
    courseType !== 'All',
    priceType !== 'All',
    category !== 'All',
  ].filter(Boolean).length

  const formatLevel = (level) => {
    if (!level) return 'Not specified'

    return (
      level.charAt(0) +
      level.slice(1).toLowerCase()
    )
  }

  const formatDuration = (weeks) => {
    const duration = Number(weeks)

    if (!duration || duration <= 0) {
      return 'Duration not specified'
    }

    return duration === 1 ? '1 Week' : `${duration} Weeks`
  }

  const formatPrice = (resource) => {
    if (
      resource.price === null ||
      resource.price === undefined ||
      resource.price === ''
    ) {
      return 'Price varies'
    }

    const currency = resource.currency || 'INR'

    if (currency === 'INR') {
      return `₹${resource.price}`
    }

    return `${currency} ${resource.price}`
  }

  const renderResource = (resource, index) => {
    const pricingType = (
      resource.pricing_type || ''
    ).toUpperCase()

    const isFree = pricingType === 'FREE'

    return (
      <div
        className="discovery-resource"
        key={resource.id || `${resource.title}-${index}`}
      >
        <div className="discovery-resource-header">
          <span
            className={`discovery-resource-badge ${
              isFree ? 'free-price' : 'paid-price'
            }`}
          >
            {isFree ? 'FREE' : 'PAID'}
          </span>

          {resource.price !== null &&
            resource.price !== undefined &&
            resource.price !== '' && (
              <span className="discovery-resource-price">
                <IndianRupee size={14} />
                {formatPrice(resource)}
              </span>
            )}

          {isFree && (
            <span className="discovery-resource-price">
              Free Access
            </span>
          )}

          {!isFree &&
            (resource.price === null ||
              resource.price === undefined ||
              resource.price === '') && (
              <span className="discovery-resource-price">
                {formatPrice(resource)}
              </span>
            )}
        </div>

        <h4>{resource.title || 'Learning Resource'}</h4>

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

  return (
    <main className="course-discovery-page">

      {/* Hero Section */}
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
            <span> Shape Your Future.</span>
          </h1>

          <p>
            Find learning opportunities that match your interests,
            schedule and budget. Choose online or offline and
            free or paid learning resources.
          </p>
        </motion.div>
      </section>

      {/* Course Discovery Section */}
      <section className="course-discovery-container">

        <div className="course-discovery-heading">
          <div>
            <span className="course-discovery-label">
              COURSE LIBRARY
            </span>

            <h2>Explore All Courses</h2>

            <p>
              Choose the learning format and resources that work for you.
            </p>
          </div>

          <div className="course-result-count">
            <BookOpen size={19} />
            {filteredCourses.length} Courses Found
          </div>
        </div>

        {/* Filter Panel */}
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

            {/* Learning Mode */}
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

            {/* Pricing */}
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

            {/* Category */}
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

            {/* Sorting */}
            <label className="course-filter-control">
              <span>Sort By</span>

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

        {/* Course Results */}
        <div className="course-discovery-results">

          {loading ? (

            <div className="course-discovery-loading">
              <LoaderCircle
                size={35}
                className="course-loading-icon"
              />

              <h3>Loading Courses...</h3>

              <p>
                Fetching available courses from Learnova.
              </p>
            </div>

          ) : error ? (

            <div className="course-discovery-empty">
              <BookOpen size={40} />

              <h3>Unable to Load Courses</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => loadCourses()}
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>

          ) : filteredCourses.length > 0 ? (

            <div className="course-discovery-grid">

              {filteredCourses.map((course, index) => {
                const isOnline =
                  course.learning_mode === 'ONLINE'

                const resources = getCourseResources(course)

                return (
                  <motion.article
                    className="discovery-course-card"
                    key={course.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.04,
                    }}
                  >

                    <div className="discovery-card-top">
                      <span className="discovery-category">
                        {course.category || 'General'}
                      </span>

                      <span className="discovery-course-match">
                        Course
                      </span>
                    </div>

                    <div className="discovery-course-icon">
                      <BookOpen size={25} />
                    </div>

                    <h3>{course.name}</h3>

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

                        {isOnline ? 'Online' : 'Offline'}
                      </span>

                      <span>
                        <Clock size={16} />
                        {formatDuration(course.duration_weeks)}
                      </span>

                    </div>

                    <div className="discovery-course-level">
                      <GraduationCap size={16} />
                      {formatLevel(course.difficulty_level)}
                    </div>

                    {/* FREE and PAID Resources */}
                    <div className="discovery-resources-section">
                      <div className="discovery-resources-heading">
                        <h4>Available Learning Resources</h4>
                        <span>{resources.length} Available</span>
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
                            No learning resources are currently available
                            for this course.
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
                Try changing your search or filters to see more courses.
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
