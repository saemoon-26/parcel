import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard/Dashboard'
import Products from './components/Products/Products'
import Riders from './components/Riders/Riders'
import Merchants from './components/Merchants/Merchants'
import Settings from './components/Settings/Settings'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: '/', label: 'Dashboard', icon: '📊' },
    { id: '/products', label: 'Products', icon: '📦' },
    { id: '/riders', label: 'Riders', icon: '🚴' },
    { id: '/merchants', label: 'Merchants', icon: '🏪' },
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
            <Route path="/riders" element={<Riders />} />
            <Route path="/merchants" element={<Merchants />} />
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
      <AppContent />
    </Router>
  )
}

export default App 