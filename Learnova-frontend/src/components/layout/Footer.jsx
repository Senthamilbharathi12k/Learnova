import { Link } from 'react-router-dom'
import { GraduationCap, Mail, MapPin, ArrowUp } from 'lucide-react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="learnova-footer">
      <div className="container-custom footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon"><GraduationCap size={25} /></span>
            <span>Learn<span>ova</span></span>
          </Link>
          <p className="footer-description">
            Learn Skills. Discover Courses. Build Your Future.
            Explore learning opportunities and take your next step with confidence.
          </p>
        </div>

        <div className="footer-link-column">
          <h3>Explore</h3>
          <a href="/#courses">Discover Courses</a>
          <a href="/#about">About Learnova</a>
          <a href="/#resources">Learning Resources</a>
        </div>

        <div className="footer-link-column">
          <h3>Account</h3>
          <Link to="/login">Student Login</Link>
          <Link to="/register">Create Account</Link>
        </div>

        <div className="footer-link-column footer-contact">
          <h3>Get in Touch</h3>
          <p><Mail size={17} /> Learn with us</p>
          <p><MapPin size={17} /> India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container-custom footer-bottom-inner">
          <p>© {currentYear} Learnova. All rights reserved.</p>
          <a href="#" className="back-to-top" aria-label="Back to top">
            Back to top <ArrowUp size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
