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
import RiderRegistrationPage from './components/RiderRegistrationPage/RiderRegistrationPage'
import RiderLogin from './components/RiderAuth/RiderLogin'
import RiderDashboardAuth from './components/RiderAuth/RiderDashboard'
import RiderStatusCheck from './components/RiderAuth/RiderStatusCheck'
import MerchantRegistrationPage from './components/MerchantRegistrationPage/MerchantRegistrationPage'
import MerchantLogin from './components/MerchantAuth/MerchantLogin'
import MerchantDashboard from './components/MerchantAuth/MerchantDashboard'
import WelcomePage from './components/WelcomePage/WelcomePage'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: '/', label: 'Dashboard', icon: '📊' },
    { id: '/products', label: 'Products', icon: '📦' },
    { id: '/riders', label: 'Riders', icon: '🚴' },
    { id: '/merchants', label: 'Merchants', icon: '🏪' },
    { id: '/rider-dashboard', label: 'Rider Dashboard', icon: '🚚' },
    { id: '/track', label: 'Track Your Parcel', icon: '🔍' },
    { id: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleMenuClick = (path) => {
    navigate(path)
    setSidebarOpen(false)
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
        </nav>
      </div>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="main-content">
        <div className="content-header">
          <h2>{menuItems.find(item => item.id === location.pathname)?.label || 'Dashboard'}</h2>
        </div>
        <div className="content-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/riders" element={<RidersMain />} />
            <Route path="/merchants" element={<Merchants />} />
            <Route path="/rider-dashboard" element={<RiderDashboard />} />
            <Route path="/rider-registration" element={<RiderRegistrationPage />} />
            <Route path="/track" element={<TrackParcel />} />
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
        {/* Welcome Page */}
        <Route path="/welcome" element={<WelcomePage />} />
        
        {/* Rider Auth Routes - Without Layout */}
        <Route path="/rider/register" element={<RiderRegistrationPage />} />
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/status" element={<RiderStatusCheck />} />
        <Route path="/rider/dashboard" element={<RiderDashboardAuth />} />
        
        {/* Merchant Auth Routes - Without Layout */}
        <Route path="/merchant/register" element={<MerchantRegistrationPage />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        
        {/* Admin Routes - With Layout */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  )
}

export default App 