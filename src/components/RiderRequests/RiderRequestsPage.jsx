import { useState, useEffect } from 'react';
import axios from 'axios';
import './RiderRequestsPage.css';

const RiderRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Get rider ID from localStorage (from auth data or direct riderId)
  const getRiderId = () => {
    const riderData = localStorage.getItem('riderData');
    if (riderData) {
      try {
        const parsed = JSON.parse(riderData);
        return parsed.id || parsed.user_id;
      } catch (e) {
        ;
      }
    }
    return localStorage.getItem('riderId') || 5;
  };
  
  const riderId = getRiderId();

  useEffect(() => {
    fetchPendingRequests();
    // Auto-refresh disabled - manual refresh only
    // Uncomment below line to enable auto-refresh every 60 seconds
    // const interval = setInterval(fetchPendingRequests, 60000);
    // return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/rider/${riderId}/pending-requests`);
      if (response.data.success) {
        setRequests(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      ;
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessing(requestId);
    try {
      const response = await axios.post('http://localhost:8000/api/rider/request/accept', {
        request_id: requestId,
        rider_id: riderId
      });

      if (response.data.success) {
        showNotification('success', '🎉 Parcel Assigned Successfully!');
        setRequests(requests.filter(req => req.request_id !== requestId));
      } else {
        showNotification('error', response.data.message);
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessing(requestId);
    try {
      const response = await axios.post('http://localhost:8000/api/rider/request/reject', {
        request_id: requestId,
        rider_id: riderId
      });

      if (response.data.success) {
        showNotification('info', 'Request Rejected');
        setRequests(requests.filter(req => req.request_id !== requestId));
      }
    } catch (error) {
      showNotification('error', 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  if (loading) {
    return (
      <div className="rider-requests-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rider-requests-page">
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <header className="requests-header">
        <div className="header-content">
          <div className="header-left">
            <div className="icon-badge">
              <span className="icon">📦</span>
            </div>
            <div>
              <h1 className="header-title">Delivery Requests</h1>
              <p className="header-subtitle">Accept parcels near you</p>
            </div>
          </div>
          <div className="header-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              onClick={fetchPendingRequests} 
              className="manual-refresh-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)'
              }}
            >
              🔄 Refresh
            </button>
            <div className="stats-badge">
              <span className="stats-number">{requests.length}</span>
              <span className="stats-label">Pending</span>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="requests-container">
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Pending Requests</h2>
            <p>New delivery requests will appear here</p>
            <button className="refresh-btn" onClick={fetchPendingRequests}>
              <span className="refresh-icon">🔄</span>
              Refresh
            </button>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request, index) => (
              <div 
                key={request.request_id} 
                className="request-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="score-badge" style={{ background: getScoreColor(request.score) }}>
                  <div className="score-number">{request.score}</div>
                  <div className="score-label">{getScoreLabel(request.score)}</div>
                </div>

                <div className="card-header">
                  <div className="tracking-info">
                    <span className="tracking-label">Tracking</span>
                    <span className="tracking-code">{request.tracking_code}</span>
                  </div>
                  <div className="payment-badge">
                    <span className="payment-icon">{request.payment_method === 'cod' ? '💵' : '💳'}</span>
                    <span>{request.payment_method.toUpperCase()}</span>
                  </div>
                </div>

                <div className="locations-section">
                  <div className="location-item pickup">
                    <div className="location-icon">📍</div>
                    <div className="location-details">
                      <span className="location-label">Pickup</span>
                      <span className="location-text">Kohinoor City (CourierHub Warehouse)</span>
                      <span className="location-city">Faisalabad</span>
                    </div>
                  </div>

                  <div className="location-divider">
                    <div className="divider-line"></div>
                    <div className="divider-icon">🚚</div>
                  </div>

                  <div className="location-item dropoff">
                    <div className="location-icon">🎯</div>
                    <div className="location-details">
                      <span className="location-label">Dropoff</span>
                      <span className="location-text">{request.client_address}</span>
                    </div>
                  </div>
                </div>

                <div className="client-section">
                  <div className="client-info">
                    <div className="info-item">
                      <span className="info-icon">👤</span>
                      <span className="info-text">{request.client_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📞</span>
                      <span className="info-text">{request.client_phone}</span>
                    </div>
                  </div>
                </div>

                <div className="payout-section">
                  <div className="payout-label">Your Earning</div>
                  <div className="payout-amount">Rs. {request.rider_payout}</div>
                </div>

                <div className="time-section">
                  <span className="time-icon">🕐</span>
                  <span className="time-text">{new Date(request.sent_at).toLocaleString()}</span>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleReject(request.request_id)}
                    disabled={processing === request.request_id}
                  >
                    <span className="btn-icon">✕</span>
                    <span>Reject</span>
                  </button>
                  <button
                    className="action-btn accept-btn"
                    onClick={() => handleAccept(request.request_id)}
                    disabled={processing === request.request_id}
                  >
                    {processing === request.request_id ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✓</span>
                        <span>Accept</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderRequestsPage;
