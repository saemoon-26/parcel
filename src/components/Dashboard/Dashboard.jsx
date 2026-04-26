import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalParcels: 0,
    activeRiders: 0,
    totalMerchants: 0,
    deliveredToday: 0,
    pendingParcels: 0,
    totalRevenue: 0,
    deliveredParcels: 0,
    outForDelivery: 0,
    failedParcels: 0
  })
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [modalData, setModalData] = useState(null)
  const [allParcels, setAllParcels] = useState([])
  const [allRiders, setAllRiders] = useState([])
  const [allMerchants, setAllMerchants] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [parcelsRes, ridersRes, merchantsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/parcels'),
        axios.get('http://localhost:8000/api/riders'),
        axios.get('http://localhost:8000/api/merchants')
      ])

      const parcels = parcelsRes.data.data || parcelsRes.data || []
      const riders = ridersRes.data.data || ridersRes.data || []
      const merchants = merchantsRes.data.data || merchantsRes.data || []

      setAllParcels(parcels)
      setAllRiders(riders)
      setAllMerchants(merchants)

      const today = new Date().toISOString().split('T')[0]
      const deliveredToday = parcels.filter(p => 
        p.parcel_status === 'delivered' && p.updated_at?.startsWith(today)
      ).length

      const deliveredParcels = parcels.filter(p => p.parcel_status === 'delivered')

      const totalRevenue = deliveredParcels.reduce((sum, p) => {
        const riderPayout = parseFloat(p.rider_payout) || 0
        const companyPayout = parseFloat(p.company_payout) || 0
        return sum + riderPayout + companyPayout
      }, 0)

      setStats({
        totalParcels: parcels.length,
        activeRiders: riders.filter(r => r.status === 'active' || r.role === 'rider').length,
        totalMerchants: merchants.length,
        deliveredToday,
        pendingParcels: parcels.filter(p => p.parcel_status === 'pending').length,
        totalRevenue,
        deliveredParcels: deliveredParcels.length,
        outForDelivery: parcels.filter(p => p.parcel_status === 'out_for_delivery').length,
        failedParcels: parcels.filter(p => p.parcel_status === 'failed' || p.parcel_status === 'cancelled').length
      })

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleCardClick = (type) => {
    let data = []
    let title = ''
    
    switch(type) {
      case 'total':
        data = allParcels
        title = 'All Parcels'
        break
      case 'delivered':
        data = allParcels.filter(p => p.parcel_status === 'delivered')
        title = 'Delivered Parcels'
        break
      case 'pending':
        data = allParcels.filter(p => p.parcel_status === 'pending')
        title = 'Pending Parcels'
        break
      case 'riders':
        data = allRiders.filter(r => r.status === 'active' || r.role === 'rider')
        title = 'Active Riders'
        break
      case 'merchants':
        data = allMerchants
        title = 'All Merchants'
        break
      case 'today':
        const today = new Date().toISOString().split('T')[0]
        data = allParcels.filter(p => p.parcel_status === 'delivered' && p.updated_at?.startsWith(today))
        title = 'Delivered Today'
        break
      case 'outForDelivery':
        data = allParcels.filter(p => p.parcel_status === 'out_for_delivery')
        title = 'Out for Delivery'
        break
      default:
        return
    }
    
    setModalData({ type, data, title })
  }

  const closeModal = () => {
    setModalData(null)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      delivered: { class: 'badge-delivered', text: 'Delivered' },
      out_for_delivery: { class: 'badge-delivery', text: 'Out for Delivery' },
      failed: { class: 'badge-failed', text: 'Failed' },
      cancelled: { class: 'badge-cancelled', text: 'Cancelled' },
      active: { class: 'badge-active', text: 'Active' },
      inactive: { class: 'badge-inactive', text: 'Inactive' }
    }
    return badges[status] || { class: 'badge-default', text: status }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header"></div>

      <div className="stats-grid">
        <div className="stat-card primary" onClick={() => handleCardClick('total')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Parcels</h3>
            <p className="stat-number">{stats.totalParcels}</p>
          </div>
        </div>
        
        <div className="stat-card success" onClick={() => handleCardClick('delivered')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Delivered Parcels</h3>
            <p className="stat-number">{stats.deliveredParcels}</p>
          </div>
        </div>
        
        <div className="stat-card info" onClick={() => handleCardClick('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Parcels</h3>
            <p className="stat-number">{stats.pendingParcels}</p>
          </div>
        </div>

        <div className="stat-card rider" onClick={() => handleCardClick('riders')}>
          <div className="stat-icon">🚴</div>
          <div className="stat-content">
            <h3>Active Riders</h3>
            <p className="stat-number">{stats.activeRiders}</p>
          </div>
        </div>
        
        <div className="stat-card merchant" onClick={() => handleCardClick('merchants')}>
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Total Merchants</h3>
            <p className="stat-number">{stats.totalMerchants}</p>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">Rs. {stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card today" onClick={() => handleCardClick('today')}>
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Delivered Today</h3>
            <p className="stat-number">{stats.deliveredToday}</p>
          </div>
        </div>

        <div className="stat-card warning" onClick={() => handleCardClick('outForDelivery')}>
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>Out for Delivery</h3>
            <p className="stat-number">{stats.outForDelivery}</p>
          </div>
        </div>
      </div>

      {modalData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-content ${modalData.type === 'riders' || modalData.type === 'merchants' ? 'modal-small' : 'modal-large'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalData.title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {modalData.data.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No data available</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {modalData.type === 'riders' ? (
                          <>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Status</th>
                          </>
                        ) : modalData.type === 'merchants' ? (
                          <>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Business Name</th>
                            <th>Phone</th>
                          </>
                        ) : (
                          <>
                            <th>Tracking Code</th>
                            <th>Client Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Pickup Location</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Total Amount</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.data.map((item, index) => (
                        <tr key={index}>
                          {modalData.type === 'riders' ? (
                            <>
                              <td>{item.id}</td>
                              <td className="name-cell">{item.first_name} {item.last_name}</td>
                              <td>{item.phone || 'N/A'}</td>
                              <td>{item.city || 'N/A'}</td>
                              <td>
                                <span className={`status-badge ${getStatusBadge(item.status || 'active').class}`}>
                                  {getStatusBadge(item.status || 'active').text}
                                </span>
                              </td>
                            </>
                          ) : modalData.type === 'merchants' ? (
                            <>
                              <td>{item.id}</td>
                              <td className="name-cell">{item.first_name} {item.last_name}</td>
                              <td>{item.company?.company_name || 'N/A'}</td>
                              <td>{item.phone || 'N/A'}</td>
                            </>
                          ) : (
                            <>
                              <td className="tracking-cell">{item.tracking_code}</td>
                              <td className="name-cell">{item.details?.client_name || 'N/A'}</td>
                              <td>{item.details?.client_phone_number || 'N/A'}</td>
                              <td>{item.details?.client_address || 'N/A'}</td>
                              <td>{item.pickup_location || 'N/A'}{item.pickup_city ? `, ${item.pickup_city}` : ''}</td>
                              <td>
                                <span className={`status-badge ${getStatusBadge(item.parcel_status).class}`}>
                                  {getStatusBadge(item.parcel_status).text}
                                </span>
                              </td>
                              <td>{item.payment_method || 'N/A'}</td>
                              <td className="amount-cell">Rs. {(parseFloat(item.rider_payout || 0) + parseFloat(item.company_payout || 0)).toFixed(2)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
