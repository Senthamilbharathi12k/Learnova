import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, GraduationCap, ArrowRight } from 'lucide-react'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="learnova-header">
      <nav className="learnova-navbar container-custom">
        <Link to="/" className="learnova-brand" onClick={closeMenu}>
          <span className="brand-icon"><GraduationCap size={25} /></span>
          <span>Learn<span>ova</span></span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        <div className={`navbar-content ${menuOpen ? 'navbar-content-open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <a href="/#courses" onClick={closeMenu}>Courses</a>
            <a href="/#about" onClick={closeMenu}>About</a>
            <a href="/#resources" onClick={closeMenu}>Resources</a>
          </div>

          <div className="navbar-actions">
            <Link to="/login" className="navbar-login" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="btn-primary-custom navbar-register" onClick={closeMenu}>
              Get Started <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
