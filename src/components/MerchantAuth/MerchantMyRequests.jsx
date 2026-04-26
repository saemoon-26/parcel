import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Chip, Grid, Button, CircularProgress, Alert } from '@mui/material'
import { Refresh, CheckCircle, HourglassEmpty, Cancel, EmojiEvents } from '@mui/icons-material'
import axios from 'axios'

const MerchantMyRequests = ({ merchantId }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [merchantId])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get('http://127.0.0.1:8000/api/merchant/delivery-requests')
      
      if (response.data.status) {
        // Filter requests for current merchant
        const merchantRequests = response.data.data.filter(req => req.merchant_id === merchantId)
        setRequests(merchantRequests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'warning',
        icon: <HourglassEmpty />,
        label: 'Pending Review',
        bgColor: '#fff3cd',
        textColor: '#856404'
      },
      approved: {
        color: 'success',
        icon: <CheckCircle />,
        label: 'Approved',
        bgColor: '#d4edda',
        textColor: '#155724'
      },
      rejected: {
        color: 'error',
        icon: <Cancel />,
        label: 'Rejected',
        bgColor: '#f8d7da',
        textColor: '#721c24'
      },
      completed: {
        color: 'info',
        icon: <EmojiEvents />,
        label: 'Completed',
        bgColor: '#d1ecf1',
        textColor: '#0c5460'
      }
    }
    return configs[status] || configs.pending
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          My Delivery Requests
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchRequests}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)'
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {requests.filter(r => r.request_status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {requests.filter(r => r.request_status === 'approved').length}
              </Typography>
              <Typography variant="body2">Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {requests.filter(r => r.request_status === 'rejected').length}
              </Typography>
              <Typography variant="body2">Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {requests.filter(r => r.request_status === 'completed').length}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            📭 No delivery requests yet
          </Typography>
          <Typography color="text.secondary">
            Click "Request to Deliver Parcels" to create your first request
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => {
            const statusConfig = getStatusConfig(request.request_status)
            return (
              <Grid item xs={12} md={6} key={request.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Request #{request.id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {new Date(request.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        sx={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.textColor,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: statusConfig.textColor
                          }
                        }}
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Typography sx={{ color: '#7f8c8d', minWidth: '120px', fontSize: '0.9rem' }}>
                          📍 Pickup:
                        </Typography>
                        <Typography sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.9rem' }}>
                          {request.pickup_address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#7f8c8d', minWidth: '120px', fontSize: '0.9rem' }}>
                          🏙️ City:
                        </Typography>
                        <Typography sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.9rem' }}>
                          {request.pickup_city}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#7f8c8d', minWidth: '120px', fontSize: '0.9rem' }}>
                          📦 Parcels:
                        </Typography>
                        <Typography sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.9rem' }}>
                          {request.total_parcels} parcels
                        </Typography>
                      </Box>

                      {request.parcel_weight && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#7f8c8d', minWidth: '120px', fontSize: '0.9rem' }}>
                            ⚖️ Weight:
                          </Typography>
                          <Typography sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.9rem' }}>
                            {request.parcel_weight}
                          </Typography>
                        </Box>
                      )}

                      {request.special_instructions && (
                        <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Typography sx={{ color: '#7f8c8d', fontSize: '0.85rem', mb: 0.5 }}>
                            📝 Special Instructions:
                          </Typography>
                          <Typography sx={{ color: '#2c3e50', fontSize: '0.9rem' }}>
                            {request.special_instructions}
                          </Typography>
                        </Box>
                      )}

                      {request.admin_notes && (
                        <Box sx={{ mt: 1, p: 2, bgcolor: '#e8f4f8', borderRadius: 2, border: '1px solid #b3d9e8' }}>
                          <Typography sx={{ color: '#0c5460', fontSize: '0.85rem', mb: 0.5, fontWeight: 600 }}>
                            💬 Admin Notes:
                          </Typography>
                          <Typography sx={{ color: '#0c5460', fontSize: '0.9rem' }}>
                            {request.admin_notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ecf0f1' }}>
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {new Date(request.updated_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

export default MerchantMyRequests
