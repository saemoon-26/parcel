import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole }) => {
  const getAuthData = () => {
    if (requiredRole === 'admin') {
      return { token: localStorage.getItem('adminToken'), data: localStorage.getItem('adminData') }
    } else if (requiredRole === 'rider') {
      return { token: localStorage.getItem('riderToken'), data: localStorage.getItem('riderData') }
    } else if (requiredRole === 'merchant') {
      return { token: localStorage.getItem('merchantToken'), data: localStorage.getItem('merchantData') }
    }
    return { token: null, data: null }
  }

  const { token, data } = getAuthData()

  console.log('🔒 ProtectedRoute Check:', { requiredRole, hasToken: !!token, hasData: !!data })

  if (!token || !data) {
    console.log('❌ Access Denied - Redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ Access Granted')
  return children
}

export default ProtectedRoute
