import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard/Dashboard'
import Products from './components/Products/Products'
import RidersMain from './components/Riders/RidersMain'
import Merchants from './components/Merchants/Merchants'
import Settings from './components/Settings/Settings'
import TrackParcel from './components/TrackParcel/TrackParcel'
import RiderDashboard from './components/RiderDashboard/RiderDashboard'
import RiderProfile from './components/RiderDashboard/RiderProfile'
import RiderRegistrationPage from './components/RiderRegistrationPage/RiderRegistrationPage'
import MerchantRegistrationPage from './components/MerchantRegistrationPage/MerchantRegistrationPage'
import MerchantDashboard from './components/MerchantAuth/MerchantDashboard'
import LandingPage from './components/LandingPage/LandingPage'
import RegisterPage from './components/RegisterPage/RegisterPage'
import Login from './components/Auth/Login'
import RiderRequestsPage from './components/RiderRequests/RiderRequestsPage'
import MerchantDeliveryRequests from './components/Dashboard/MerchantDeliveryRequests'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
    { id: '/products', label: 'Products', icon: '📦' },
    { id: '/riders', label: 'Riders', icon: '🚴' },
    { id: '/merchants', label: 'Merchants', icon: '🏪' },
    { id: '/delivery-requests', label: 'Delivery Requests', icon: '📨' },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleMenuClick = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    localStorage.removeItem('riderToken')
    localStorage.removeItem('riderData')
    localStorage.removeItem('merchantToken')
    localStorage.removeItem('merchantData')
    navigate('/', { replace: true })
  }

  return (
    <div className="app">
      <header className="header">
        <button className="menu-btn" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="app-title">Parcel Management System</h1>
        <button onClick={handleLogout} style={{
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '15px',
          marginLeft: 'auto',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
        >
          🚪 Logout
        </button>
      </header>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${location.pathname === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <button
            className="nav-item logout-btn"
            onClick={handleLogout}
            style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </div>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="main-content">
        
        <div className="content-body">
          <Routes>
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/riders" element={<RidersMain />} />
            <Route path="/merchants" element={<Merchants />} />
            <Route path="/delivery-requests" element={<MerchantDeliveryRequests />} />
            <Route path="/rider-registration" element={<RiderRegistrationPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Without Layout */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Register Page - Without Layout */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Track Parcel - Without Layout */}
        <Route path="/track" element={<TrackParcel />} />
        
        {/* Login Page - Without Layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Rider Routes - Without Layout */}
        <Route path="/rider/register" element={<RiderRegistrationPage />} />
        <Route path="/rider-dashboard" element={<ProtectedRoute requiredRole="rider"><RiderDashboard /></ProtectedRoute>} />
        <Route path="/rider/profile" element={<ProtectedRoute requiredRole="rider"><RiderProfile /></ProtectedRoute>} />
        <Route path="/rider/requests" element={<ProtectedRoute requiredRole="rider"><RiderRequestsPage /></ProtectedRoute>} />
        
        {/* Merchant Routes - Without Layout */}
        <Route path="/merchant/register" element={<MerchantRegistrationPage />} />
        <Route path="/merchant/dashboard" element={<ProtectedRoute requiredRole="merchant"><MerchantDashboard /></ProtectedRoute>} />
        
        {/* Admin Routes - With Layout */}
        <Route path="/*" element={<ProtectedRoute requiredRole="admin"><AppContent /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App 
