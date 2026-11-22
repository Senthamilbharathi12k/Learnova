
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  BriefcaseBusiness,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Code2,
  Palette,
  BookOpen,
  Globe,
  X,
  LayoutTemplate,
} from 'lucide-react'

import { getPortfolioResources } from '../../services/portfolioResourceService'
import './PortfolioResources.css'

const categories = [
  'All',
  'Developer Portfolio',
  'Design Portfolio',
  'Website Builder',
  'Portfolio Templates',
  'Learning & Inspiration',
]

const categoryLabels = {
  DEVELOPER_PORTFOLIO: 'Developer Portfolio',
  DESIGN_PORTFOLIO: 'Design Portfolio',
  WEBSITE_BUILDER: 'Website Builder',
  PORTFOLIO_TEMPLATES: 'Portfolio Templates',
  LEARNING_INSPIRATION: 'Learning & Inspiration',
}

function PortfolioResources() {
  const [resources, setResources] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch portfolio resources from backend API
  const fetchResources = useCallback(async () => {
  try {
    const data = await getPortfolioResources()

    const resourceList = Array.isArray(data?.resources)
      ? data.resources
      : []

    setResources(resourceList)
    setError('')
  } catch (err) {
    console.error('Portfolio resources fetch error:', err)

    const status = err.response?.status

    if (status === 401) {
      setError(
        'Your session may have expired. Please log in again to view portfolio resources.'
      )
    } else if (status === 403) {
      setError(
        'You do not have permission to access these resources.'
      )
    } else if (!err.response) {
      setError(
        'Unable to connect to the server. Please check your internet connection and try again.'
      )
    } else {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Unable to load portfolio resources. Please try again.'
      )
    }

    setResources([])
  } finally {
    setIsLoading(false)
  }
}, [])

useEffect(() => {
  let isMounted = true

  const fetchInitialResources = async () => {
    try {
      const data = await getPortfolioResources()

      if (!isMounted) return

      const resourceList = Array.isArray(data?.resources)
        ? data.resources
        : []

      setResources(resourceList)
      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Portfolio resources fetch error:', err)

      const status = err.response?.status

      if (status === 401) {
        setError(
          'Your session may have expired. Please log in again to view portfolio resources.'
        )
      } else if (status === 403) {
        setError(
          'You do not have permission to access these resources.'
        )
      } else if (!err.response) {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      } else {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.error ||
          'Unable to load portfolio resources. Please try again.'
        )
      }

      setResources([])
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  fetchInitialResources()

  return () => {
    isMounted = false
  }
}, [])

  // Search and category filtering
  const filteredResources = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return resources.filter((resource) => {
      const categoryName = String(
        categoryLabels[resource.category] ||
        resource.category ||
        'Other'
      )

      const title = String(resource.title || '')
      const description = String(resource.description || '')

      const features = Array.isArray(resource.features)
        ? resource.features.join(' ')
        : ''

      const matchesSearch =
        title.toLowerCase().includes(search) ||
        description.toLowerCase().includes(search) ||
        categoryName.toLowerCase().includes(search) ||
        features.toLowerCase().includes(search)

      const matchesCategory =
        selectedCategory === 'All' ||
        categoryName === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [resources, searchTerm, selectedCategory])

  // Clear search and category filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
  }

  // Select icon based on resource category
  const getResourceIcon = (category) => {
    if (category === 'Developer Portfolio') return Code2
    if (category === 'Design Portfolio') return Palette
    if (category === 'Website Builder') return Globe
    if (category === 'Portfolio Templates') return LayoutTemplate

    return BookOpen
  }

  // Validate external resource URL
  const isValidExternalUrl = (url) => {
    if (!url) return false

    try {
      const parsedUrl = new URL(url)

      return (
        parsedUrl.protocol === 'https:' ||
        parsedUrl.protocol === 'http:'
      )
    } catch {
      return false
    }
  }

  return (
    <main className="portfolio-resources-page">

      {/* Hero Section */}
      <section className="portfolio-resources-hero">
        <motion.div
          className="portfolio-hero-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="portfolio-hero-eyebrow">
            <Sparkles size={17} /> SHOWCASE YOUR WORK
          </span>

          <h1>
            Build Your Portfolio.
            <span> Share Your Potential.</span>
          </h1>

          <p>
            Discover platforms and resources to showcase your projects,
            technical skills, creative work and achievements.
          </p>
        </motion.div>
      </section>

      {/* Resources Section */}
      <section className="portfolio-resources-container">

        {/* Section Heading */}
        <div className="portfolio-section-heading">
          <div>
            <span className="portfolio-section-label">
              EXTERNAL RESOURCES
            </span>

            <h2>Portfolio Platforms & Tools</h2>

            <p>
              Choose a platform that suits your skills and the work you want
              to showcase.
            </p>
          </div>

          <div className="portfolio-resource-count">
            <BriefcaseBusiness size={19} />

            {isLoading
              ? 'Loading...'
              : `${filteredResources.length} Resources`}
          </div>
        </div>

        {/* Information Banner */}
        <div className="portfolio-info-banner">
          <CheckCircle2 size={21} />

          <p>
            Learnova provides links to external portfolio platforms.
            Portfolio creation, hosting and publishing are handled by those
            respective websites.
          </p>
        </div>

        {/* Search and Filter Toolbar */}
        <div className="portfolio-toolbar">

          <div className="portfolio-search-box">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search portfolio resources..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search portfolio resources"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <label className="portfolio-category-filter">
            <LayoutTemplate size={18} />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              aria-label="Filter portfolio resources by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All'
                    ? 'All Categories'
                    : category}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="portfolio-clear-button"
            onClick={clearFilters}
          >
            <X size={16} /> Clear
          </button>
        </div>

        {/* Resource Cards */}
        <div className="portfolio-resource-grid">

          {isLoading ? (

            <div className="portfolio-empty-state">
              <BriefcaseBusiness size={40} />

              <h3>Loading Portfolio Resources...</h3>

              <p>
                Please wait while we fetch the resources.
              </p>
            </div>

          ) : error ? (

            <div className="portfolio-empty-state">
              <BriefcaseBusiness size={40} />

              <h3>Unable to Load Resources</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={fetchResources}
                className="portfolio-clear-button"
              >
                Try Again
              </button>
            </div>

          ) : filteredResources.length > 0 ? (

            filteredResources.map((resource, index) => {
              const categoryName = String(
                categoryLabels[resource.category] ||
                resource.category ||
                'Other'
              )

              const ResourceIcon = getResourceIcon(categoryName)

              const features = Array.isArray(resource.features)
                ? resource.features
                : []

              const validUrl = isValidExternalUrl(resource.url)

              return (
                <motion.article
                  className="portfolio-resource-card"
                  key={resource.id ?? `${resource.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                >

                  <div className="portfolio-card-top">

                    <span className="portfolio-card-category">
                      {categoryName}
                    </span>

                    <span className="portfolio-card-access">
                      {resource.access || 'Access details unavailable'}
                    </span>

                  </div>

                  <div className="portfolio-card-icon">
                    <ResourceIcon size={25} />
                  </div>

                  <h3>
                    {resource.title || 'Untitled Resource'}
                  </h3>

                  <p className="portfolio-card-description">
                    {resource.description ||
                      'No description available.'}
                  </p>

                  {features.length > 0 && (
                    <div className="portfolio-card-features">

                      <strong>Features</strong>

                      {features.map((feature, featureIndex) => (
                        <span key={`${feature}-${featureIndex}`}>
                          <CheckCircle2 size={15} />
                          {feature}
                        </span>
                      ))}

                    </div>
                  )}

                  {validUrl ? (

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portfolio-resource-button"
                      aria-label={`Visit ${resource.title || 'portfolio resource'} website`}
                    >
                      Visit Website
                      <ExternalLink size={16} />
                    </a>

                  ) : (

                    <span
                      className="portfolio-resource-button"
                      aria-disabled="true"
                      title="External website link is unavailable"
                    >
                      Link Unavailable
                    </span>

                  )}

                </motion.article>
              )
            })

          ) : (

            <div className="portfolio-empty-state">
              <BriefcaseBusiness size={40} />

              <h3>No resources found</h3>

              <p>
                Try another search term or choose a different category.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="portfolio-clear-button"
              >
                Clear Filters
              </button>
            </div>

          )}

        </div>

        {/* Student Career Guide */}
        <div className="portfolio-bottom-tip">

          <div className="portfolio-tip-icon">
            <Sparkles size={23} />
          </div>

          <div className="portfolio-tip-content">

            <span className="portfolio-guide-label">
              STUDENT CAREER GUIDE
            </span>

            <h3>How to Build a Professional Portfolio</h3>

            <p>
              A portfolio is a collection of your projects, skills,
              achievements and work samples. It helps recruiters understand
              what you can actually create and accomplish.
            </p>

            <h4>Essential Portfolio Sections</h4>

            <ul>
              <li>
                <strong>Home / Introduction:</strong> Your name,
                professional title and a short introduction.
              </li>

              <li>
                <strong>About Me:</strong> Your education, interests,
                career goals and background.
              </li>

              <li>
                <strong>Skills:</strong> Programming languages, tools,
                technologies and other relevant skills.
              </li>

              <li>
                <strong>Projects:</strong> Your best academic, personal
                and internship projects.
              </li>

              <li>
                <strong>Project Details:</strong> Problem statement,
                your role, technologies used, screenshots and results.
              </li>

              <li>
                <strong>Live Demo & GitHub:</strong> Links to working
                projects and source code, wherever available.
              </li>

              <li>
                <strong>Education:</strong> Degree, college, department
                and graduation year.
              </li>

              <li>
                <strong>Experience:</strong> Internships, freelance work
                or relevant practical experience, if applicable.
              </li>

              <li>
                <strong>Certifications & Achievements:</strong> Relevant
                certificates, awards and accomplishments.
              </li>

              <li>
                <strong>Resume:</strong> A link to view or download your
                latest resume.
              </li>

              <li>
                <strong>Contact:</strong> Professional email, LinkedIn,
                GitHub and other relevant contact links.
              </li>
            </ul>

            <h4>Professional Portfolio Tips</h4>

            <ul>
              <li>
                Use a clean, modern and mobile-friendly design.
              </li>

              <li>
                Show your best and most relevant projects first.
              </li>

              <li>
                Explain your individual contribution to every project.
              </li>

              <li>
                Add screenshots, live demos and GitHub links where possible.
              </li>

              <li>
                Make sure every button and external link works.
              </li>

              <li>
                Use consistent colors, fonts and spacing.
              </li>

              <li>
                Keep your portfolio updated as you learn new skills.
              </li>
            </ul>

            <p className="portfolio-guide-note">
              <strong>For Freshers:</strong> You do not need professional
              work experience to create a portfolio. Academic projects,
              personal projects, mini projects and practical learning work
              are valuable starting points.
            </p>

          </div>
        </div>

      </section>
    </main>
  )
}

export default PortfolioResources
