
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
      setResources(Array.isArray(data.resources) ? data.resources : [])
    } catch (err) {
      if (err.response?.status === 401) {
        setError(
          'Please log in with your student account to access resume resources.'
        )
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to load resume resources. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const filteredResources = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return resources.filter((resource) => {
      const categoryLabel =
        categoryLabels[resource.category] || resource.category

      const matchesSearch =
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        categoryLabel.toLowerCase().includes(search)

      const matchesCategory =
        selectedCategory === 'All' ||
        resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [resources, searchTerm, selectedCategory])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
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
            <p>
              Choose a resource to create, check or improve your resume.
            </p>
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
              const categoryLabel =
                categoryLabels[resource.category] || resource.category

              const ResourceIcon =
                resource.category === 'ATS_CHECKER'
                  ? ClipboardCheck
                  : resource.category === 'RESUME_GUIDANCE'
                    ? BookOpen
                    : FileText

              const accessLabel =
                resource.pricing_type === 'FREE' ? 'Free' : 'Paid'

              return (
                <motion.article
                  className="resume-resource-card"
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
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

                  <h3>{resource.title}</h3>

                  <p className="resume-card-description">
                    {resource.description}
                  </p>

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-resource-button"
                  >
                    Visit Website <ExternalLink size={16} />
                  </a>
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
