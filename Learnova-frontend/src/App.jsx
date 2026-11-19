
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Home from './pages/public/Home'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Logout from './pages/auth/Logout'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import ResetPassword from './pages/auth/ResetPassword'

import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentSkills from './pages/student/StudentSkills'
import CourseRecommendations from './pages/student/CourseRecommendations'
import CourseDiscovery from './pages/student/CourseDiscovery'
import ResumeResources from './pages/student/ResumeResources'
import PortfolioResources from './pages/student/PortfolioResources'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Student Pages */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/skills"
          element={
            <ProtectedRoute>
              <StudentSkills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/recommendations"
          element={
            <ProtectedRoute>
              <CourseRecommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <CourseDiscovery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/resume-resources"
          element={
            <ProtectedRoute>
              <ResumeResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/portfolio-resources"
          element={
            <ProtectedRoute>
              <PortfolioResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App
