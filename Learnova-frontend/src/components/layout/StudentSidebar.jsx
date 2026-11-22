
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UserRound,
  Brain,
  ClipboardCheck,
  Sparkles,
  Compass,
  Bookmark,
  GitCompare,
  CalendarDays,
  TrendingUp,
  FileText,
  BriefcaseBusiness,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import './StudentSidebar.css'

const mainMenu = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { title: 'My Profile', icon: UserRound, path: '/student/profile' },
  { title: 'Skills & Interests', icon: Brain, path: '/student/skills' },
  { title: 'Skills Assessment', icon: ClipboardCheck, path: '/student/assessment' },
  { title: 'Course Recommendations', icon: Sparkles, path: '/student/recommendations' },
  { title: 'Explore Courses', icon: Compass, path: '/student/courses' },
  { title: 'Saved Courses', icon: Bookmark, path: '/student/saved-courses' },
  { title: 'Course Comparison', icon: GitCompare, path: '/student/course-comparison' },
  { title: 'Learning Planner', icon: CalendarDays, path: '/student/learning-planner' },
  { title: 'Learning Progress', icon: TrendingUp, path: '/student/learning-progress' },
  { title: 'Resume Resources', icon: FileText, path: '/student/resume-resources' },
  { title: 'Portfolio Resources', icon: BriefcaseBusiness, path: '/student/portfolio-resources' },
  { title: 'Virtual Work Experience', icon: BriefcaseBusiness, path: '/student/virtual-experience', },
]


function StudentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    setMobileOpen(false)
    navigate('/logout')
  }

  const renderMenu = (items) =>
    items.map((item) => {
      const Icon = item.icon

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/student/dashboard'}
          className={({ isActive }) =>
            `sidebar-menu-link ${isActive ? 'active' : ''}`
          }
          onClick={() => setMobileOpen(false)}
          title={collapsed ? item.title : ''}
        >
          <Icon size={19} strokeWidth={2} />
          <span>{item.title}</span>
        </NavLink>
      )
    })

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`student-sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${
          mobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={27} />
          </div>

          <div className="sidebar-brand-text">
            <h2>LEARNOVA</h2>
            <span>LEARN • GROW • ACHIEVE</span>
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-menu-container">
          <div className="sidebar-section-label">MAIN MENU</div>

          <nav className="sidebar-navigation">
            {renderMenu(mainMenu)}
          </nav>

          <div className="sidebar-section-label account-label">
            ACCOUNT
          </div>

          <nav className="sidebar-navigation">

          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <Sparkles size={19} />
            <div>
              <strong>Keep Learning!</strong>
              <span>Build your future with Learnova.</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default StudentSidebar
