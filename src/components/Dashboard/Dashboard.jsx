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
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh disabled - use manual refresh button
    // Uncomment below to enable auto-refresh every 30 seconds
    // const interval = setInterval(() => {
    //   if (autoRefresh) {
    //     fetchDashboardData()
    //   }
    // }, 30000)
    // return () => clearInterval(interval)
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
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }



  const handleExportReport = () => {
    const report = `
=== DASHBOARD REPORT ===
Generated: ${new Date().toLocaleString()}

STATISTICS:
- Total Parcels: ${stats.totalParcels}
- Delivered Today: ${stats.deliveredToday}
- Pending: ${stats.pendingParcels}
- Active Riders: ${stats.activeRiders}
- Total Merchants: ${stats.totalMerchants}
- Total Revenue: Rs. ${stats.totalRevenue.toLocaleString()}

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
            <h3>Delivered Parcels</h3>
            <p className="stat-number">{stats.deliveredParcels}</p>
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

        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Delivered Today</h3>
            <p className="stat-number">{stats.deliveredToday}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>Out for Delivery</h3>
            <p className="stat-number">{stats.outForDelivery}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Failed/Cancelled</h3>
            <p className="stat-number">{stats.failedParcels}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard