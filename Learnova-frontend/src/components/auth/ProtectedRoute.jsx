
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const location = useLocation()

  const accessToken =
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('accessToken')

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return children
}

export default ProtectedRoute
