import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Parcels</h3>
          <p className="stat-number">1,234</p>
        </div>
        <div className="stat-card">
          <h3>Active Riders</h3>
          <p className="stat-number">56</p>
        </div>
        <div className="stat-card">
          <h3>Merchants</h3>
          <p className="stat-number">89</p>
        </div>
        <div className="stat-card">
          <h3>Delivered Today</h3>
          <p className="stat-number">234</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard