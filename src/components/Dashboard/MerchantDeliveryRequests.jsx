import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './MerchantDeliveryRequests.css'

function MerchantDeliveryRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://127.0.0.1:8000/api/merchant/delivery-requests')
      if (response.data.status) {
        setRequests(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this request?`)) {
      return
    }

    setUpdating(true)
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/merchant/delivery-request/${requestId}/update-status`,
        {
          request_status: newStatus,
          admin_notes: adminNotes
        }
      )

      if (response.data.status) {
        alert(`✅ Request ${newStatus} successfully!`)
        fetchRequests()
        setSelectedRequest(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('❌ Failed to update request status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: '⏳ Pending', color: '#f39c12' },
      approved: { class: 'badge-approved', text: '✅ Approved', color: '#27ae60' },
      rejected: { class: 'badge-rejected', text: '❌ Rejected', color: '#e74c3c' },
      completed: { class: 'badge-completed', text: '🎉 Completed', color: '#3498db' }
    }
    return badges[status] || { class: 'badge-default', text: status, color: '#95a5a6' }
  }

  const openRequestDetails = (request) => {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setAdminNotes('')
  }

  if (loading) {
    return <div className="loading-container">Loading delivery requests...</div>
  }

  return (
    <div className="delivery-requests-container">
      <div className="page-header">
        <h1>📦 Merchant Delivery Requests</h1>
        <button className="refresh-btn" onClick={fetchRequests}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-box pending">
          <span className="stat-number">{requests.filter(r => r.request_status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-box approved">
          <span className="stat-number">{requests.filter(r => r.request_status === 'approved').length}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-box rejected">
          <span className="stat-number">{requests.filter(r => r.request_status === 'rejected').length}</span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className="stat-box completed">
          <span className="stat-number">{requests.filter(r => r.request_status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No delivery requests yet</h3>
          <p>Merchant delivery requests will appear here</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card" onClick={() => openRequestDetails(request)}>
              <div className="card-header">
                <div className="merchant-info">
                  <h3>{request.company_name || request.merchant_name}</h3>
                  <p className="merchant-email">{request.merchant_email}</p>
                </div>
                <span 
                  className={`status-badge ${getStatusBadge(request.request_status).class}`}
                  style={{ backgroundColor: getStatusBadge(request.request_status).color }}
                >
                  {getStatusBadge(request.request_status).text}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">📍 Pickup Address:</span>
                  <span className="value">{request.pickup_address}</span>
                </div>
                <div className="info-row">
                  <span className="label">🏙️ City:</span>
                  <span className="value">{request.pickup_city}</span>
                </div>
                <div className="info-row">
                  <span className="label">📦 Total Parcels:</span>
                  <span className="value">{request.total_parcels}</span>
                </div>
                {request.parcel_weight && (
                  <div className="info-row">
                    <span className="label">⚖️ Weight:</span>
                    <span className="value">{request.parcel_weight}</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span className="date">📅 {new Date(request.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="details-section">
                <h3>Merchant Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Company Name:</label>
                    <span>{selectedRequest.company_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Merchant Name:</label>
                    <span>{selectedRequest.merchant_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedRequest.merchant_email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedRequest.merchant_phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Product Type:</label>
                    <span>{selectedRequest.product_type || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Company Address:</label>
                    <span>{selectedRequest.company_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Pickup Information</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Pickup Address:</label>
                    <span>{selectedRequest.pickup_address}</span>
                  </div>
                  <div className="detail-item">
                    <label>City:</label>
                    <span>{selectedRequest.pickup_city}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Parcels:</label>
                    <span>{selectedRequest.total_parcels}</span>
                  </div>
                  {selectedRequest.parcel_weight && (
                    <div className="detail-item">
                      <label>Approximate Weight:</label>
                      <span>{selectedRequest.parcel_weight}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.special_instructions && (
                <div className="details-section">
                  <h3>Special Instructions</h3>
                  <p className="instructions-text">{selectedRequest.special_instructions}</p>
                </div>
              )}

              <div className="details-section">
                <h3>Admin Notes</h3>
                <textarea
                  className="admin-notes-input"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this request..."
                  rows="4"
                />
              </div>

              <div className="details-section">
                <h3>Request Status</h3>
                <div className="status-info">
                  <span>Current Status: </span>
                  <span 
                    className={`status-badge ${getStatusBadge(selectedRequest.request_status).class}`}
                    style={{ backgroundColor: getStatusBadge(selectedRequest.request_status).color }}
                  >
                    {getStatusBadge(selectedRequest.request_status).text}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedRequest.request_status === 'pending' && (
                <>
                  <button
                    className="action-btn approve-btn"
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    disabled={updating}
                  >
                    ✅ Approve Request
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    disabled={updating}
                  >
                    ❌ Reject Request
                  </button>
                </>
              )}
              {selectedRequest.request_status === 'approved' && (
                <button
                  className="action-btn complete-btn"
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                  disabled={updating}
                >
                  🎉 Mark as Completed
                </button>
              )}
              <button className="action-btn cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MerchantDeliveryRequests
