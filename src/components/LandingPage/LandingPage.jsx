import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeService, setActiveService] = useState(0)

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const riderToken = localStorage.getItem('riderToken')
    const merchantToken = localStorage.getItem('merchantToken')

    if (adminToken) navigate('/admin-dashboard', { replace: true })
    else if (riderToken) navigate('/rider-dashboard', { replace: true })
    else if (merchantToken) navigate('/merchant/dashboard', { replace: true })
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService(prev => (prev + 1) % 6)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    { icon: '📦', title: 'Parcel Booking', desc: 'Easy online parcel booking for merchants', time: 'Instant' },
    { icon: '🚴', title: 'Smart Rider Assignment', desc: 'AI-powered automatic rider allocation', time: 'Real-time' },
    { icon: '📍', title: 'Live Tracking', desc: 'Track your parcel in real-time on map', time: '24/7' },
    { icon: '🏪', title: 'Merchant Dashboard', desc: 'Complete parcel management for businesses', time: 'Always On' },
    { icon: '💰', title: 'COD Service', desc: 'Cash on delivery payment option', time: 'Available' },
    { icon: '🚚', title: 'Multi-City Delivery', desc: 'Delivery across all major cities', time: '1-3 Days' }
  ]

  const features = [
    { icon: '📍', title: 'Real-Time Tracking', desc: 'Track your parcel every step of the way' },
    { icon: '🔒', title: 'Secure Delivery', desc: 'Insurance coverage on all shipments' },
    { icon: '💰', title: 'Best Prices', desc: 'Competitive rates guaranteed' },
    { icon: '⚡', title: 'Fast Processing', desc: 'Quick pickup and delivery' },
    { icon: '📞', title: '24/7 Support', desc: 'Always here to help you' },
    { icon: '✅', title: '99% Success Rate', desc: 'Trusted by thousands' }
  ]

  const stats = [
    { number: '50K+', label: 'Deliveries' },
    { number: '5K+', label: 'Happy Clients' },
    { number: '200+', label: 'Riders' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📦</span>
            <span className="logo-text">Courier<span className="highlight">Hub</span></span>
          </div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-buttons">
            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-register" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <div className="animated-bg"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">Fast & Reliable</span>
              <span className="title-line highlight-text">Courier Services</span>
            </h1>
            <p className="hero-subtitle">Delivering happiness to your doorstep with speed, care, and precision</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => {

                navigate('/track')
              }}>
                <span>Track Parcel</span>
                <span className="btn-icon">🔍</span>
              </button>
              <button className="btn-secondary" onClick={() => navigate('/register')}>
                <span>Get Started</span>
                <span className="btn-icon">→</span>
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <span className="card-icon">📦</span>
              <span className="card-text">Express Delivery</span>
            </div>
            <div className="floating-card card-2">
              <span className="card-icon">✅</span>
              <span className="card-text">Delivered</span>
            </div>
            <div className="floating-card card-3">
              <span className="card-icon">🚴</span>
              <span className="card-text">On the way</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Choose the perfect delivery option for your needs</p>
        </div>
        <div className="services-grid">
          {services.map((service, idx) => (
            <div key={idx} className={`service-card ${activeService === idx ? 'active' : ''}`}>
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.desc}</p>
              <div className="service-time">
                <span className="time-icon">⏱️</span>
                <span>{service.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Experience the difference with CourierHub</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple steps to send your parcel</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Book Online</h3>
            <p>Enter pickup and delivery details</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">📦</div>
            <h3>Pack & Pickup</h3>
            <p>We collect from your location</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">🚚</div>
            <h3>Track Delivery</h3>
            <p>Monitor real-time status</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-icon">✅</div>
            <h3>Delivered</h3>
            <p>Safe delivery guaranteed</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-image">
            <div className="about-img-placeholder">
              <span className="placeholder-icon">🚚</span>
            </div>
          </div>
          <div className="about-content">
            <h2 className="about-title">About <span className="highlight">CourierHub</span></h2>
            <p className="about-text">
              We are Pakistan's leading courier service provider, committed to delivering excellence. 
              With over 5 years of experience, we've built a reputation for reliability, speed, and customer satisfaction.
            </p>
            <p className="about-text">
              Our network of professional riders and advanced tracking technology ensures your parcels 
              reach their destination safely and on time, every time.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <span className="feature-check">✓</span>
                <span>Nationwide Coverage</span>
              </div>
              <div className="about-feature">
                <span className="feature-check">✓</span>
                <span>Professional Team</span>
              </div>
              <div className="about-feature">
                <span className="feature-check">✓</span>
                <span>Advanced Technology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Grow Your Business With Us</h2>
          <p className="cta-subtitle">Partner with CourierHub and expand your delivery network across Pakistan</p>
          <button className="cta-button" onClick={() => navigate('/merchant/register')}>
            Become A Business Partner
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3 className="footer-title">
              <span className="logo-icon">📦</span>
              CourierHub
            </h3>
            <p className="footer-desc">Your trusted delivery partner</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>📞 +92 300 1234567</p>
            <p>📧 info@courierhub.pk</p>
            <p>📍 Karachi, Pakistan</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 CourierHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
