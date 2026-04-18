import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './RiderDashboard.css'
import RiderLiveTracking from './RiderLiveTracking'

const RiderDashboard = () => {
  const navigate = useNavigate()
  const [riderData, setRiderData] = useState(null)
  const [parcels, setParcels] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [trackingParcel, setTrackingParcel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyParcel, setVerifyParcel] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifyMessage, setVerifyMessage] = useState({ type: '', text: '' })

  const loadParcels = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/parcels`)
      const data = await response.json()
      
      if (data.status || data.data) {
        const allParcels = data.data || []
        const riderParcels = allParcels.filter(parcel => 
          parcel.assigned_to == id || parcel.rider_id == id
        )
        setParcels(riderParcels)
      } else {
        setParcels([])
      }
    } catch (error) {
      console.error('Error loading parcels:', error)
      setParcels([])
    }
  }

  useEffect(() => {
    const storedRiderData = localStorage.getItem('riderData')
    if (!storedRiderData) {
      navigate('/login')
      return
    }
    const rider = JSON.parse(storedRiderData)
    setRiderData(rider)
    
    const userId = rider.user_id || rider.address?.user_id || rider.id
    
    if (userId) {
      loadParcels(userId)
      setLoading(false)
      
      // Auto-refresh disabled - use manual refresh button
      // Uncomment below to enable auto-refresh every 30 seconds
      // const interval = setInterval(() => {
      //   loadParcels(userId)
      // }, 30000)
      // return () => clearInterval(interval)
    } else {
      console.error('No user ID found in:', rider)
      setLoading(false)
    }
  }, [])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (trackingParcel) {
        setTrackingParcel(null)
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    if (trackingParcel) {
      window.history.pushState(null, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [trackingParcel])

  const handlePickupRequest = async (parcel) => {
    if (!confirm(`Request pickup approval for parcel ${parcel.tracking_code}?`)) {
      return
    }
    
    try {
      const updateData = {
        tracking_code: parcel.tracking_code,
        client_name: parcel.client_name || parcel.details?.client_name,
        client_phone_number: parcel.client_phone_number || parcel.details?.client_phone_number,
        client_address: parcel.client_address || parcel.details?.client_address,
        client_email: parcel.client_email || parcel.details?.client_email || '',
        pickup_location: parcel.pickup_location,
        pickup_city: parcel.pickup_city,
        assigned_to: parcel.assigned_to,
        parcel_status: 'pickup_requested',
        payment_method: parcel.payment_method || '',
        rider_payout: parcel.rider_payout || 0,
        company_payout: parcel.company_payout || 0
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/parcels/${parcel.parcel_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('✅ Pickup request sent to admin for approval!')
        const userId = riderData.user_id || riderData.address?.user_id || riderData.id
        if (userId) {
          loadParcels(userId)
        }
      } else {
        alert(`❌ Failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error requesting pickup:', error)
      alert('❌ Error sending pickup request')
    }
  }

  const handleStartDelivery = async (parcel) => {
    if (!confirm(`Start delivery for parcel ${parcel.tracking_code}?`)) {
      return
    }
    
    try {
      const updateData = {
        tracking_code: parcel.tracking_code,
        client_name: parcel.client_name || parcel.details?.client_name,
        client_phone_number: parcel.client_phone_number || parcel.details?.client_phone_number,
        client_address: parcel.client_address || parcel.details?.client_address,
        client_email: parcel.client_email || parcel.details?.client_email || '',
        pickup_location: parcel.pickup_location,
        pickup_city: parcel.pickup_city,
        assigned_to: parcel.assigned_to,
        parcel_status: 'out_for_delivery',
        payment_method: parcel.payment_method || '',
        rider_payout: parcel.rider_payout || 0,
        company_payout: parcel.company_payout || 0
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/parcels/${parcel.parcel_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        alert('✅ Delivery started!')
        const userId = riderData.user_id || riderData.address?.user_id || riderData.id
        if (userId) {
          loadParcels(userId)
        }
      } else {
        const data = await response.json()
        alert(`❌ Failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error starting delivery:', error)
      alert('❌ Error starting delivery')
    }
  }

  const handleVerifyDelivery = async () => {
    if (!verificationCode.trim()) {
      setVerifyMessage({ type: 'error', text: 'Please enter verification code' })
      return
    }
    if (verificationCode.length !== 4) {
      setVerifyMessage({ type: 'error', text: 'Code must be 4 digits' })
      return
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: verifyParcel.tracking_code,
          verification_code: verificationCode
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setVerifyMessage({ type: 'success', text: '✅ Parcel delivered successfully!' })
        setTimeout(() => {
          setVerifyOpen(false)
          setVerificationCode('')
          setVerifyMessage({ type: '', text: '' })
          const userId = riderData.user_id || riderData.address?.user_id || riderData.id
          if (userId) loadParcels(userId)
        }, 1500)
      } else {
        setVerifyMessage({ type: 'error', text: data.message || '❌ Invalid verification code' })
      }
    } catch (error) {
      console.error('Error verifying delivery:', error)
      setVerifyMessage({ type: 'error', text: '❌ Error verifying delivery' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('riderToken')
    localStorage.removeItem('riderData')
    navigate('/', { replace: true })
  }

  const getFilteredParcels = () => {
    if (filter === 'all') return parcels
    return parcels.filter(p => {
      if (filter === 'pending') return p.parcel_status === 'pending' || p.parcel_status === 'pickup_requested'
      if (filter === 'out_for_delivery') return p.parcel_status === 'out_for_delivery'
      if (filter === 'delivered') return p.parcel_status === 'delivered'
      return true
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800'
      case 'pickup_requested': return '#ff5722'
      case 'picked_up': return '#9c27b0'
      case 'out_for_delivery': return '#2196f3'
      case 'delivered': return '#4caf50'
      case 'cancelled': return '#f44336'
      default: return '#9e9e9e'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'pickup_requested': return '🔔'
      case 'picked_up': return '📦'
      case 'out_for_delivery': return '🚚'
      case 'delivered': return '✅'
      case 'cancelled': return '❌'
      default: return '📦'
    }
  }

  const stats = {
    total: parcels.length,
    pending: parcels.filter(p => p.parcel_status === 'pending' || p.parcel_status === 'pickup_requested').length,
    out_for_delivery: parcels.filter(p => p.parcel_status === 'out_for_delivery').length,
    delivered: parcels.filter(p => p.parcel_status === 'delivered').length
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="rider-dashboard">
      <div className="rider-header">
        <div className="rider-info">
          <div className="rider-avatar">
            {riderData?.first_name?.charAt(0) || riderData?.full_name?.charAt(0) || 'R'}{riderData?.last_name?.charAt(0) || ''}
          </div>
          <div className="rider-details">
            <h2>{riderData?.first_name || riderData?.full_name || 'Rider'} {riderData?.last_name || ''}</h2>
            <p>ID: {riderData?.id || riderData?.user_id || riderData?.rider_id || 'N/A'} • {riderData?.phone_number || riderData?.mobile_primary || 'N/A'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/rider/requests')} className="requests-btn" style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📦 Pending Requests
          </button>
          <button onClick={() => {
            const userId = riderData.user_id || riderData.address?.user_id || riderData.id
            if (userId) loadParcels(userId)
          }} className="refresh-btn">🔄 Refresh</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total" onClick={() => navigate('/rider/requests')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>New</h3>
            <p>Pending Requests</p>
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
            <h3>{stats.out_for_delivery}</h3>
            <p>Out for Delivery</p>
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
        <button className={filter === 'out_for_delivery' ? 'active' : ''} onClick={() => setFilter('out_for_delivery')}>
          Out for Delivery ({stats.out_for_delivery})
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
            <div key={parcel.id} className="parcel-card">
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
                  <h4>👤 {parcel.details?.client_name || parcel.client_name}</h4>
                  <p>📞 {parcel.details?.client_phone_number || parcel.client_phone_number}</p>
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
                      <p className="location-text">{parcel.details?.client_address || parcel.dropoff_location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="parcel-footer">
                  <div className="payment-info">
                    <span>💰 Rider Payout: <strong>Rs. {parcel.rider_payout || 0}</strong></span>
                  </div>
                  <div className="parcel-actions">
                    {parcel.parcel_status === 'pending' && (
                      <button className="pickup-btn" onClick={() => handlePickupRequest(parcel)}>
                        🔔 Request Pickup Approval
                      </button>
                    )}
                    {parcel.parcel_status === 'pickup_requested' && (
                      <button className="waiting-btn" disabled>
                        ⏳ Waiting for Admin Approval
                      </button>
                    )}
                    {parcel.parcel_status === 'picked_up' && (
                      <button className="transit-btn" onClick={() => handleStartDelivery(parcel)}>
                        🚚 Start Delivery
                      </button>
                    )}
                    {parcel.parcel_status === 'out_for_delivery' && (
                      <button className="verify-btn" onClick={() => {
                        setVerifyParcel(parcel)
                        setVerifyOpen(true)
                      }}>
                        ✅ Verify Delivery
                      </button>
                    )}
                    <button className="view-details-btn" onClick={() => setSelectedParcel(parcel)}>
                      View Details
                    </button>
                    {parcel.parcel_status === 'out_for_delivery' && (
                      <button className="start-tracking-btn" onClick={() => setTrackingParcel(parcel)}>
                        📍 Start Tracking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {trackingParcel && (
        <RiderLiveTracking 
          parcel={trackingParcel} 
          onClose={() => setTrackingParcel(null)} 
        />
      )}

      {verifyOpen && verifyParcel && (
        <div className="modal-overlay" onClick={() => {
          setVerifyOpen(false)
          setVerificationCode('')
          setVerifyMessage({ type: '', text: '' })
        }}>
          <div className="verify-modal" onClick={(e) => e.stopPropagation()}>
            <div className="verify-header">
              <h2>✅ Verify Delivery</h2>
              <button className="close-btn" onClick={() => {
                setVerifyOpen(false)
                setVerificationCode('')
                setVerifyMessage({ type: '', text: '' })
              }}>×</button>
            </div>
            <div className="verify-body">
              <div className="verify-parcel-info">
                <div className="verify-icon">📦</div>
                <div>
                  <p className="verify-tracking">{verifyParcel.tracking_code}</p>
                  <p className="verify-client">{verifyParcel.details?.client_name || verifyParcel.client_name}</p>
                </div>
              </div>
              
              {verifyMessage.text && (
                <div className={`verify-message ${verifyMessage.type}`}>
                  {verifyMessage.text}
                </div>
              )}
              
              <div className="verify-input-section">
                <label>Enter 4-Digit Verification Code</label>
                <input
                  type="text"
                  className="verify-code-input"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setVerificationCode(value)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && verificationCode.length === 4) {
                      handleVerifyDelivery()
                    }
                  }}
                  placeholder="0 0 0 0"
                  maxLength="4"
                  autoFocus
                />
                <p className="verify-hint">📞 Ask customer for the code sent to their email/SMS</p>
              </div>
            </div>
            <div className="verify-footer">
              <button className="verify-cancel-btn" onClick={() => {
                setVerifyOpen(false)
                setVerificationCode('')
                setVerifyMessage({ type: '', text: '' })
              }}>Cancel</button>
              <button 
                className="verify-submit-btn" 
                onClick={handleVerifyDelivery}
                disabled={verificationCode.length !== 4}
              >
                ✅ Verify & Complete
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="detail-value">{selectedParcel.details?.client_name || selectedParcel.client_name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedParcel.details?.client_phone_number || selectedParcel.client_phone_number || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedParcel.details?.client_email || selectedParcel.client_email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pickup Location:</span>
                <span className="detail-value">{selectedParcel.pickup_location}, {selectedParcel.pickup_city}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dropoff Address:</span>
                <span className="detail-value">{selectedParcel.details?.client_address || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{selectedParcel.payment_method?.toUpperCase() || 'COD'}</span>
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
            <div className="modal-footer">
              {(selectedParcel.parcel_status === 'out_for_delivery') && (
                <button 
                  className="modal-tracking-btn" 
                  onClick={() => {
                    setTrackingParcel(selectedParcel)
                    setSelectedParcel(null)
                  }}
                >
                  📍 Start Live Tracking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiderDashboard
