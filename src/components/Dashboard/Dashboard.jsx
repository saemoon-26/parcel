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
    inTransitParcels: 0,
    totalRevenue: 0,
    pendingRiders: 0
  })
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchDashboardData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      const [parcelsRes, ridersRes, merchantsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/parcels'),
        axios.get('http://localhost:8000/api/riders'),
        axios.get('http://localhost:8000/api/merchants')
      ])

      const parcels = parcelsRes.data.data || parcelsRes.data || []
      const riders = ridersRes.data.data || ridersRes.data || []
      const merchants = merchantsRes.data.data || merchantsRes.data || []

      const today = new Date().toISOString().split('T')[0]
      const deliveredToday = parcels.filter(p => 
        p.parcel_status === 'delivered' && p.updated_at?.startsWith(today)
      ).length

      const totalRevenue = parcels
        .filter(p => p.parcel_status === 'delivered')
        .reduce((sum, p) => {
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
        inTransitParcels: parcels.filter(p => p.parcel_status === 'in_transit').length,
        totalRevenue,
        pendingRiders: riders.filter(r => r.status === 'pending').length
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    if (!window.confirm('Auto-assign pending parcels to available riders using AI?')) return
    
    try {
      const response = await axios.post('http://localhost:8000/api/auto-assign-pending')
      alert(`Success! ${response.data.assigned || 0} parcels assigned using ${response.data.algorithm}`)
      fetchDashboardData()
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleExportReport = () => {
    const report = `
=== DASHBOARD REPORT ===
Generated: ${new Date().toLocaleString()}

STATISTICS:
- Total Parcels: ${stats.totalParcels}
- Delivered Today: ${stats.deliveredToday}
- In Transit: ${stats.inTransitParcels}
- Pending: ${stats.pendingParcels}
- Active Riders: ${stats.activeRiders}
- Total Merchants: ${stats.totalMerchants}
- Total Revenue: Rs. ${stats.totalRevenue.toLocaleString()}
- Pending Riders: ${stats.pendingRiders}

TOP PERFORMERS:
${topRiders.map((r, i) => `${i+1}. ${r.name} - ${r.deliveries} deliveries - Rs. ${r.earnings.toFixed(0)}`).join('\n')}
    `
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRefreshAll = () => {
    fetchDashboardData()
    alert('Dashboard refreshed successfully!')
  }

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="refresh-controls">
          <button className="ai-assign-btn" onClick={handleAutoAssign}>
            🤖 AI Auto-Assign Parcels
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Parcels</h3>
            <p className="stat-number">{stats.totalParcels}</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Delivered Today</h3>
            <p className="stat-number">{stats.deliveredToday}</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>In Transit</h3>
            <p className="stat-number">{stats.inTransitParcels}</p>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Parcels</h3>
            <p className="stat-number">{stats.pendingParcels}</p>
          </div>
        </div>
        
        <div className="stat-card rider">
          <div className="stat-icon">🚴</div>
          <div className="stat-content">
            <h3>Active Riders</h3>
            <p className="stat-number">{stats.activeRiders}</p>
          </div>
        </div>
        
        <div className="stat-card merchant">
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
        
        <div className="stat-card pending">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Pending Riders</h3>
            <p className="stat-number">{stats.pendingRiders}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard