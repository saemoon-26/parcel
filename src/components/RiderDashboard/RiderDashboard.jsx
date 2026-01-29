import { useState, useEffect } from 'react'
import './RiderDashboard.css'

const RiderDashboard = () => {
  const [riderId, setRiderId] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [riderData, setRiderData] = useState(null)
  const [parcels, setParcels] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedParcel, setSelectedParcel] = useState(null)

  const handleLogin = async () => {
    if (!riderId.trim()) return
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/riders/${riderId}`)
      const data = await response.json()
      
      if (data.status && data.data) {
        setRiderData(data.data)
        setIsLoggedIn(true)
        loadParcels(riderId)
      } else {
        alert('Rider ID not found!')
      }
    } catch (error) {
      alert('Error connecting to server!')
    }
  }

  const loadParcels = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/riders/${id}/parcels`)
      const data = await response.json()
      
      if (data.status) {
        setParcels(data.data || [])
      }
    } catch (error) {
      console.error('Error loading parcels:', error)
      setParcels([])
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setRiderId('')
    setRiderData(null)
    setParcels([])
    setFilter('all')
  }

  const getFilteredParcels = () => {
    if (filter === 'all') return parcels
    return parcels.filter(p => {
      if (filter === 'pending') return p.parcel_status === 'pending'
      if (filter === 'in_transit') return p.parcel_status === 'in_transit'
      if (filter === 'delivered') return p.parcel_status === 'delivered'
      return true
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800'
      case 'in_transit': return '#2196f3'
      case 'delivered': return '#4caf50'
      case 'cancelled': return '#f44336'
      default: return '#9e9e9e'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'in_transit': return '🚚'
      case 'delivered': return '✅'
      case 'cancelled': return '❌'
      default: return '📦'
    }
  }

  const stats = {
    total: parcels.length,
    pending: parcels.filter(p => p.parcel_status === 'pending').length,
    in_transit: parcels.filter(p => p.parcel_status === 'in_transit').length,
    delivered: parcels.filter(p => p.parcel_status === 'delivered').length
  }

  if (!isLoggedIn) {
    return (
      <div className="rider-login-container">
        <div className="rider-login-card">
          <div className="login-header">
            <div className="login-icon">🚴</div>
            <h1>Rider Dashboard</h1>
            <p>Enter your Rider ID to access your deliveries</p>
          </div>
          <div className="login-form">
            <input
              type="text"
              placeholder="Enter Rider ID"
              value={riderId}
              onChange={(e) => setRiderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="rider-id-input"
            />
            <button onClick={handleLogin} className="login-btn">
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rider-dashboard">
      <div className="rider-header">
        <div className="rider-info">
          <div className="rider-avatar">
            {riderData?.first_name?.charAt(0)}{riderData?.last_name?.charAt(0)}
          </div>
          <div className="rider-details">
            <h2>{riderData?.first_name} {riderData?.last_name}</h2>
            <p>ID: {riderData?.id} • {riderData?.phone_number}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Parcels</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card transit">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>{stats.in_transit}</h3>
            <p>In Transit</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({stats.total})
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Pending ({stats.pending})
        </button>
        <button className={filter === 'in_transit' ? 'active' : ''} onClick={() => setFilter('in_transit')}>
          In Transit ({stats.in_transit})
        </button>
        <button className={filter === 'delivered' ? 'active' : ''} onClick={() => setFilter('delivered')}>
          Delivered ({stats.delivered})
        </button>
      </div>

      <div className="parcels-grid">
        {getFilteredParcels().length === 0 ? (
          <div className="no-parcels">
            <div className="no-parcels-icon">📭</div>
            <h3>No parcels found</h3>
            <p>You don't have any {filter !== 'all' ? filter.replace('_', ' ') : ''} parcels</p>
          </div>
        ) : (
          getFilteredParcels().map(parcel => (
            <div key={parcel.id} className="parcel-card" onClick={() => setSelectedParcel(parcel)}>
              <div className="parcel-header">
                <div className="tracking-code">
                  <span className="label">Tracking</span>
                  <span className="code">{parcel.tracking_code}</span>
                </div>
                <div className="status-badge" style={{ background: getStatusColor(parcel.parcel_status) }}>
                  {getStatusIcon(parcel.parcel_status)} {parcel.parcel_status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              
              <div className="parcel-body">
                <div className="client-info">
                  <h4>👤 {parcel.client_name}</h4>
                  <p>📞 {parcel.client_phone_number}</p>
                </div>

                <div className="location-info">
                  <div className="location-item pickup">
                    <span className="location-icon">📍</span>
                    <div>
                      <p className="location-label">Pickup</p>
                      <p className="location-text">{parcel.pickup_city}</p>
                      <p className="location-detail">{parcel.pickup_location}</p>
                    </div>
                  </div>
                  <div className="location-arrow">→</div>
                  <div className="location-item dropoff">
                    <span className="location-icon">🎯</span>
                    <div>
                      <p className="location-label">Dropoff</p>
                      <p className="location-text">{parcel.dropoff_city}</p>
                      <p className="location-detail">{parcel.dropoff_location}</p>
                    </div>
                  </div>
                </div>

                <div className="parcel-footer">
                  <div className="payment-info">
                    <span>💰 Rider Payout: <strong>Rs. {parcel.rider_payout || 0}</strong></span>
                  </div>
                  <div className="payment-method">
                    {parcel.payment_method || 'COD'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedParcel && (
        <div className="modal-overlay" onClick={() => setSelectedParcel(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Parcel Details</h2>
              <button className="close-btn" onClick={() => setSelectedParcel(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Tracking Code:</span>
                <span className="detail-value">{selectedParcel.tracking_code}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value" style={{ color: getStatusColor(selectedParcel.parcel_status) }}>
                  {getStatusIcon(selectedParcel.parcel_status)} {selectedParcel.parcel_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Client Name:</span>
                <span className="detail-value">{selectedParcel.client_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedParcel.client_phone_number}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedParcel.client_email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedParcel.client_address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pickup Location:</span>
                <span className="detail-value">{selectedParcel.pickup_location}, {selectedParcel.pickup_city}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dropoff Location:</span>
                <span className="detail-value">{selectedParcel.dropoff_location}, {selectedParcel.dropoff_city}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{selectedParcel.payment_method || 'COD'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rider Payout:</span>
                <span className="detail-value">Rs. {selectedParcel.rider_payout || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Company Payout:</span>
                <span className="detail-value">Rs. {selectedParcel.company_payout || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiderDashboard
