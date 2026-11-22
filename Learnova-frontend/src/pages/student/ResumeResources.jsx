
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  FileText,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  LayoutTemplate,
  ClipboardCheck,
  BookOpen,
  X,
} from 'lucide-react'
import { getResumeResources } from '../../services/resumeResourceService'
import './ResumeResources.css'

const categories = [
  { label: 'All', value: 'All' },
  { label: 'Resume Builder', value: 'RESUME_BUILDER' },
  { label: 'ATS Checker', value: 'ATS_CHECKER' },
  { label: 'Resume Guidance', value: 'RESUME_GUIDANCE' },
]

const categoryLabels = {
  RESUME_BUILDER: 'Resume Builder',
  ATS_CHECKER: 'ATS Checker',
  RESUME_GUIDANCE: 'Resume Guidance',
}

const getSafeText = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback

const isValidExternalUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return false

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
  } catch {
    return false
  }
}

function ResumeResources() {
  const [resources, setResources] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadResources = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getResumeResources()
      const resourceList = Array.isArray(data?.resources)
        ? data.resources
        : []

      setResources(resourceList)
    } catch (err) {
      console.error('Resume resources fetch error:', err)

      if (err.response?.status === 401) {
        setError(
          'Please log in with your student account to access resume resources.'
        )
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access these resources.')
      } else if (!err.response) {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          'Unable to load resume resources. Please try again.'
        )
      }

      setResources([])
    } finally {
      setLoading(false)
    }
  }, [])

useEffect(() => {
  let isMounted = true

  const fetchInitialResources = async () => {
    try {
      const data = await getResumeResources()

      if (!isMounted) return

      const resourceList = Array.isArray(data?.resources)
        ? data.resources
        : []

      setResources(resourceList)
      setError('')
    } catch (err) {
      if (!isMounted) return

      console.error('Resume resources fetch error:', err)

      if (err.response?.status === 401) {
        setError(
          'Please log in with your student account to access resume resources.'
        )
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to access these resources.'
        )
      } else if (!err.response) {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          'Unable to load resume resources. Please try again.'
        )
      }

      setResources([])
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  fetchInitialResources()

  return () => {
    isMounted = false
  }
}, [])

  const filteredResources = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return resources.filter((resource) => {
      const title = getSafeText(resource?.title)
      const description = getSafeText(resource?.description)
      const category = getSafeText(resource?.category, 'OTHER')
      const categoryLabel = categoryLabels[category] || category

      const features = Array.isArray(resource?.features)
        ? resource.features.filter((item) => typeof item === 'string').join(' ')
        : ''

      const searchableText =
        `${title} ${description} ${categoryLabel} ${features}`.toLowerCase()

      const matchesSearch = searchableText.includes(search)

      const matchesCategory =
        selectedCategory === 'All' || category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [resources, searchTerm, selectedCategory])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
  }

  const getResourceIcon = (category) => {
    if (category === 'ATS_CHECKER') return ClipboardCheck
    if (category === 'RESUME_GUIDANCE') return BookOpen
    return FileText
  }

  return (
    <main className="resume-resources-page">
      <section className="resume-resources-hero">
        <motion.div
          className="resume-hero-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="resume-hero-eyebrow">
            <Sparkles size={17} /> CAREER PREPARATION
          </span>

          <h1>
            Create a Resume
            <span> That Gets Noticed.</span>
          </h1>

          <p>
            Explore trusted external tools, ATS checkers, templates and
            professional guidance to prepare your resume.
          </p>
        </motion.div>
      </section>

      <section className="resume-resources-container">
        <div className="resume-section-heading">
          <div>
            <span className="resume-section-label">EXTERNAL RESOURCES</span>
            <h2>Resume Tools & Guidance</h2>
            <p>Choose a resource to create, check or improve your resume.</p>
          </div>

          <div className="resume-resource-count">
            <FileText size={19} />
            {loading ? 'Loading...' : `${filteredResources.length} Resources`}
          </div>
        </div>

        <div className="resume-info-banner">
          <CheckCircle2 size={21} />
          <p>
            Learnova provides links to external resume platforms. Resume
            creation and checking happen on the respective websites.
          </p>
        </div>

        <div className="resume-toolbar">
          <div className="resume-search-box">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search resume resources..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search resume resources"
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

          <label className="resume-category-filter">
            <LayoutTemplate size={18} />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Filter resume resources by category"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label === 'All'
                    ? 'All Categories'
                    : category.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="resume-clear-button"
            onClick={clearFilters}
          >
            <X size={16} /> Clear
          </button>
        </div>

        <div className="resume-resource-grid">
          {loading ? (
            <div className="resume-empty-state">
              <FileText size={40} />
              <h3>Loading Resume Resources...</h3>
              <p>Please wait while we fetch the resources.</p>
            </div>
          ) : error ? (
            <div className="resume-empty-state">
              <FileText size={40} />
              <h3>Unable to Load Resources</h3>
              <p>{error}</p>
              <button type="button" onClick={loadResources}>
                Try Again
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            filteredResources.map((resource, index) => {
              const category = getSafeText(resource?.category, 'OTHER')
              const categoryLabel = categoryLabels[category] || category
              const ResourceIcon = getResourceIcon(category)
              const title = getSafeText(resource?.title, 'Untitled Resource')
              const description = getSafeText(
                resource?.description,
                'No description available.'
              )
              const validUrl = isValidExternalUrl(resource?.url)
              const accessLabel =
                resource?.pricing_type === 'FREE'
                  ? 'Free'
                  : resource?.pricing_type === 'PAID'
                    ? 'Paid'
                    : 'Access details unavailable'

              const features = Array.isArray(resource?.features)
                ? resource.features.filter((item) => typeof item === 'string')
                : []

              return (
                <motion.article
                  className="resume-resource-card"
                  key={resource?.id ?? `${title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                >
                  <div className="resume-card-top">
                    <span className="resume-card-category">
                      {categoryLabel}
                    </span>
                    <span className="resume-card-access">
                      {accessLabel}
                    </span>
                  </div>

                  <div className="resume-card-icon">
                    <ResourceIcon size={25} />
                  </div>

                  <h3>{title}</h3>

                  <p className="resume-card-description">{description}</p>

                  {features.length > 0 && (
                    <div className="resume-card-features">
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
                      className="resume-resource-button"
                      aria-label={`Visit ${title} website`}
                    >
                      Visit Website <ExternalLink size={16} />
                    </a>
                  ) : (
                    <span
                      className="resume-resource-button"
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
            <div className="resume-empty-state">
              <FileText size={40} />
              <h3>No resources found</h3>
              <p>Try another search term or choose a different category.</p>
              <button type="button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="resume-bottom-tip">
          <div className="resume-tip-icon">
            <Sparkles size={23} />
          </div>

          <div className="resume-tip-content">
            <span className="resume-guide-label">STUDENT CAREER GUIDE</span>
            <h3>How to Create a Professional Resume</h3>
            <p>
              A professional resume is a short, well-organized document that
              highlights your education, skills, projects and experience for
              recruiters.
            </p>

            <h4>Essential Resume Sections</h4>
            <ul>
              <li><strong>Contact Information:</strong> Full name, professional email, phone number, LinkedIn and GitHub links.</li>
              <li><strong>Professional Summary:</strong> A short introduction about your career goal, strengths and interests.</li>
              <li><strong>Technical Skills:</strong> Relevant programming languages, tools, technologies and soft skills.</li>
              <li><strong>Education:</strong> Degree, college, department, graduation year and academic details.</li>
              <li><strong>Projects:</strong> Project title, purpose, technologies used and your contribution.</li>
              <li><strong>Internships / Experience:</strong> Organization, role, duration and responsibilities, if applicable.</li>
              <li><strong>Certifications:</strong> Relevant course certificates and professional qualifications.</li>
              <li><strong>Achievements:</strong> Relevant awards, competitions and accomplishments.</li>
            </ul>

            <h4>Professional Resume Tips</h4>
            <ul>
              <li>Keep the layout clean, consistent and easy to read.</li>
              <li>Use simple fonts, clear headings and bullet points.</li>
              <li>Prefer a single-column, ATS-friendly layout.</li>
              <li>Include keywords relevant to the job description.</li>
              <li>Use action words and measurable achievements where possible.</li>
              <li>Check spelling, grammar and contact details before applying.</li>
              <li>Save and submit the resume as a PDF unless another format is requested.</li>
            </ul>

            <p className="resume-guide-note">
              <strong>For Freshers:</strong> If you do not have work experience,
              highlight your education, academic projects, technical skills,
              internships and certifications. Never add fake experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ResumeResources
