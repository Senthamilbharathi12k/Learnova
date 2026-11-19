import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  Compass,
  Sparkles,
  CheckCircle2,
  Users,
  MonitorPlay
} from 'lucide-react'
import { motion } from 'framer-motion'
import './Home.css'

const benefits = [
  {
    icon: <Target size={27} />,
    title: 'Personalized Learning',
    description: 'Discover courses based on your skills, interests and learning goals.'
  },
  {
    icon: <Compass size={27} />,
    title: 'Discover Opportunities',
    description: 'Explore online and offline courses that match your preferences.'
  },
  {
    icon: <BookOpen size={27} />,
    title: 'Useful Resources',
    description: 'Find helpful resources to build your resume and portfolio.'
  },
  {
    icon: <GraduationCap size={27} />,
    title: 'Grow Your Skills',
    description: 'Take the next step in your learning journey with confidence.'
  }
]

const steps = [
  ['01', 'Create Your Account', 'Register and create your student profile.'],
  ['02', 'Add Skills & Interests', 'Tell us what you know and what you want to learn.'],
  ['03', 'Discover Courses', 'Explore course recommendations that match your interests.'],
  ['04', 'Build Your Future', 'Use learning and career resources to grow.']
]

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container-custom home-hero-grid">
          <motion.div
            className="home-hero-content"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="hero-eyebrow">
              <Sparkles size={16} /> YOUR LEARNING JOURNEY STARTS HERE
            </span>

            <h1>
              Learn Skills.
              <span> Discover Courses.</span>
              Build Your Future.
            </h1>

            <p>
              Explore learning opportunities, discover courses that match
              your interests and take confident steps towards your future.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn-primary-custom">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#courses" className="btn-outline-custom">
                Explore Courses
              </a>
            </div>

            <div className="hero-trust">
              <CheckCircle2 size={18} />
              <span>Discover. Learn. Improve. Grow.</span>
            </div>
          </motion.div>

          <motion.div
            className="home-hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-image-placeholder">
              <div className="hero-visual-icon">
                <GraduationCap size={100} strokeWidth={1.2} />
              </div>
              <div className="hero-floating-card hero-card-one">
                <BookOpen size={20} />
                <span>Explore Courses</span>
              </div>
              <div className="hero-floating-card hero-card-two">
                <Target size={20} />
                <span>Build Your Skills</span>
              </div>
              <div className="hero-decoration hero-decoration-one" />
              <div className="hero-decoration hero-decoration-two" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="section-padding home-about">
        <div className="container-custom home-about-grid">
          <div className="about-visual">
            <div className="about-icon-wrap">
              <GraduationCap size={76} />
            </div>
            <div className="about-small-card">
              <Sparkles size={20} />
              <span>Keep Learning, Keep Growing</span>
            </div>
          </div>

          <div className="about-content">
            <span className="home-section-label">ABOUT LEARNOVA</span>
            <h2 className="section-title">
              Your Journey Towards a Brighter Future
            </h2>
            <p className="section-description">
              Learnova is a student-focused learning platform designed to
              help you discover courses, understand your interests and
              explore useful learning resources in one place.
            </p>
            <ul className="about-points">
              <li><CheckCircle2 size={19} /> Discover courses that match your interests</li>
              <li><CheckCircle2 size={19} /> Explore online and offline learning options</li>
              <li><CheckCircle2 size={19} /> Access resume and portfolio resources</li>
            </ul>
            <Link to="/register" className="about-link">
              Start Your Journey <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding home-benefits">
        <div className="container-custom">
          <div className="home-section-heading">
            <span className="home-section-label">WHY LEARNOVA</span>
            <h2 className="section-title">Everything You Need to Grow</h2>
            <p className="section-description">
              Make your learning journey more focused and meaningful.
            </p>
          </div>

          <div className="benefit-grid">
            {benefits.map((benefit, index) => (
              <motion.article
                className="card-custom benefit-card"
                key={benefit.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="section-padding home-courses">
        <div className="container-custom">
          <div className="home-section-heading">
            <span className="home-section-label">COURSE DISCOVERY</span>
            <h2 className="section-title">Find What You Want to Learn</h2>
            <p className="section-description">
              Explore different learning areas and discover new possibilities.
            </p>
          </div>

          <div className="course-preview-grid">
            {[
              ['Technology & Programming', 'Build technical knowledge and coding skills.'],
              ['Business & Management', 'Explore business and management learning.'],
              ['Design & Creativity', 'Develop creative and design skills.']
            ].map(([title, description]) => (
              <article className="card-custom course-preview-card" key={title}>
                <div className="course-preview-icon"><MonitorPlay size={28} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span>Explore learning opportunities <ArrowRight size={16} /></span>
              </article>
            ))}
          </div>
          <p className="course-note">
            Sign in to explore course recommendations and available courses.
          </p>
        </div>
      </section>

      <section className="section-padding home-steps">
        <div className="container-custom">
          <div className="home-section-heading">
            <span className="home-section-label">HOW IT WORKS</span>
            <h2 className="section-title">Start Learning in Four Steps</h2>
            <p className="section-description">
              A simple journey to discover your next learning opportunity.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map(([number, title, description]) => (
              <div className="step-item" key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="section-padding home-resources">
        <div className="container-custom resource-banner">
          <div>
            <span className="home-section-label">CAREER RESOURCES</span>
            <h2>Prepare Yourself for New Opportunities</h2>
            <p>
              Explore helpful external tools and resources for creating
              an ATS-friendly resume and building your portfolio.
            </p>
          </div>
          <Link to="/register" className="btn-primary-custom">
            Explore Resources <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="home-cta">
        <div className="container-custom text-center">
          <Users size={38} className="cta-icon" />
          <h2>Your Future Starts with What You Learn Today.</h2>
          <p>Create your account and begin exploring learning opportunities.</p>
          <Link to="/register" className="btn-primary-custom">
            Join Learnova <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
