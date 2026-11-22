
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Public Pages
const Home = lazy(() => import('./pages/public/Home'))

// Authentication Pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Logout = lazy(() => import('./pages/auth/Logout'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))
const StudentSkills = lazy(() => import('./pages/student/StudentSkills'))
const SkillsAssessment = lazy(() => import('./pages/student/SkillsAssessment'))
const CourseRecommendations = lazy(() => import('./pages/student/CourseRecommendations'))
const CourseDiscovery = lazy(() => import('./pages/student/CourseDiscovery'))
const SavedCourses = lazy(() => import('./pages/student/SavedCourses'))
const CourseComparison = lazy(() => import('./pages/student/CourseComparison'))
const LearningPlanner = lazy(() => import('./pages/student/LearningPlanner'))
const LearningProgress = lazy(() => import('./pages/student/LearningProgress'))
const ResumeResources = lazy(() => import('./pages/student/ResumeResources'))
const PortfolioResources = lazy(() => import('./pages/student/PortfolioResources'))
const VirtualExperience = lazy(() => import('./pages/student/VirtualExperience'))
const CourseFinalAssessment = lazy(() => import('./pages/student/CourseFinalAssessment'))

// Global Styles
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Suspense
        fallback={
          <div className="app-loading">
            <div className="app-loading-spinner"></div>
            <p>Loading Learnova...</p>
          </div>
        }
      >
        <Routes>
          {/* PUBLIC PAGES */}
          <Route path="/" element={<Home />} />

          {/* AUTHENTICATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* MODULE 01 - STUDENT DASHBOARD */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* MODULE 02 - STUDENT PROFILE */}
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* MODULE 03 - SKILLS & INTERESTS */}
          <Route
            path="/student/skills"
            element={
              <ProtectedRoute>
                <StudentSkills />
              </ProtectedRoute>
            }
          />

          {/* MODULE 04 - SKILLS ASSESSMENT */}
          <Route
            path="/student/assessment"
            element={
              <ProtectedRoute>
                <SkillsAssessment />
              </ProtectedRoute>
            }
          />

          {/* MODULE 05 - COURSE RECOMMENDATIONS */}
          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute>
                <CourseRecommendations />
              </ProtectedRoute>
            }
          />

          {/* MODULE 06 - COURSE DISCOVERY */}
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute>
                <CourseDiscovery />
              </ProtectedRoute>
            }
          />

          {/* MODULE 07 - SAVED COURSES */}
          <Route
            path="/student/saved-courses"
            element={
              <ProtectedRoute>
                <SavedCourses />
              </ProtectedRoute>
            }
          />

          {/* MODULE 08 - COURSE COMPARISON */}
          <Route
            path="/student/course-comparison"
            element={
              <ProtectedRoute>
                <CourseComparison />
              </ProtectedRoute>
            }
          />

          {/* MODULE 09 - LEARNING PLANNER */}
          <Route
            path="/student/learning-planner"
            element={
              <ProtectedRoute>
                <LearningPlanner />
              </ProtectedRoute>
            }
          />

          {/* MODULE 10 - LEARNING PROGRESS */}
          <Route
            path="/student/learning-progress"
            element={
              <ProtectedRoute>
                <LearningProgress />
              </ProtectedRoute>
            }
          />

          {/* MODULE 11 - RESUME RESOURCES */}
          <Route
            path="/student/resume-resources"
            element={
              <ProtectedRoute>
                <ResumeResources />
              </ProtectedRoute>
            }
          />

          {/* PORTFOLIO RESOURCES */}
          <Route
            path="/student/portfolio-resources"
            element={
              <ProtectedRoute>
                <PortfolioResources />
              </ProtectedRoute>
            }
          />

          {/* MODULE 12 - VIRTUAL WORK EXPERIENCE */}
          <Route
            path="/student/virtual-experience"
            element={
              <ProtectedRoute>
                <VirtualExperience />
              </ProtectedRoute>
            }
          />

          {/* COURSE FINAL ASSESSMENT */}
          <Route
            path="/student/courses/:courseId/final-assessment"
            element={
              <ProtectedRoute>
                <CourseFinalAssessment />
              </ProtectedRoute>
            }
          />

          {/* LOGOUT */}
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  )
}

export default App
