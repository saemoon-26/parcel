import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Chip, Divider } from '@mui/material'
import { LocalShipping, CheckCircle, HourglassEmpty, DirectionsBike, Send, Close, Refresh, Cancel, EmojiEvents } from '@mui/icons-material'
import axios from 'axios'

const MerchantDashboardHome = ({ merchantData, stats, onViewParcels }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_city: '',
    total_parcels: '',
    parcel_weight: '',
    special_instructions: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const response = await axios.get('http://127.0.0.1:8000/api/merchant/delivery-requests')
      
      if (response.data.status) {
        const merchantRequests = response.data.data.filter(req => req.merchant_id === merchantData.id)
        setRequests(merchantRequests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      pickup_address: merchantData.company_address || '',
      pickup_city: merchantData.city || '',
      total_parcels: stats.total || '',
      parcel_weight: '',
      special_instructions: ''
    })
    setError('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmitRequest = async () => {
    if (!formData.pickup_address || !formData.pickup_city || !formData.total_parcels) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/merchant/delivery-request', {
        merchant_id: merchantData.id,
        pickup_address: formData.pickup_address,
        pickup_city: formData.pickup_city,
        total_parcels: parseInt(formData.total_parcels),
        parcel_weight: formData.parcel_weight,
        special_instructions: formData.special_instructions
      })

      if (response.data.status) {
        alert('✅ Delivery request submitted successfully! Admin will review your request.')
        handleCloseDialog()
        fetchRequests() // Refresh requests list
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      setError(error.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'warning',
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        label: 'Pending',
        bgColor: '#fff3cd',
        textColor: '#856404'
      },
      approved: {
        color: 'success',
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        label: 'Approved',
        bgColor: '#d4edda',
        textColor: '#155724'
      },
      rejected: {
        color: 'error',
        icon: <Cancel sx={{ fontSize: 16 }} />,
        label: 'Rejected',
        bgColor: '#f8d7da',
        textColor: '#721c24'
      },
      completed: {
        color: 'info',
        icon: <EmojiEvents sx={{ fontSize: 16 }} />,
        label: 'Completed',
        bgColor: '#d1ecf1',
        textColor: '#0c5460'
      }
    }
    return configs[status] || configs.pending
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>Welcome, {merchantData.business_name}</Typography>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            onClick={() => onViewParcels('all')}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              borderRadius: 2, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              transition: 'transform 0.2s', 
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' } 
            }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <LocalShipping sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.total}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Total Parcels</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            onClick={() => onViewParcels('pending')}
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white', 
              borderRadius: 2, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              transition: 'transform 0.2s', 
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' } 
            }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <HourglassEmpty sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.pending}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Pending Pickup</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            onClick={() => onViewParcels('in_transit')}
            sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              color: 'white', 
              borderRadius: 2, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              transition: 'transform 0.2s', 
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' } 
            }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <DirectionsBike sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.inTransit}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>In Transit</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            onClick={() => onViewParcels('delivered')}
            sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
              color: 'white', 
              borderRadius: 2, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              transition: 'transform 0.2s', 
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' } 
            }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CheckCircle sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.delivered}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Delivered</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Request Delivery Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<Send />}
          onClick={handleOpenDialog}
          sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            py: 1.5, 
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #e082ea 0%, #e4465b 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(240, 147, 251, 0.5)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Request to Deliver Parcels
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#7f8c8d' }}>
          Click to send delivery request to admin
        </Typography>
      </Box>

      {/* My Delivery Requests Section */}
      <Box sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            📨 My Delivery Requests
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchRequests}
            size="small"
            sx={{
              color: '#667eea',
              '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
            }}
          >
            Refresh
          </Button>
        </Box>

        {loadingRequests ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Loading requests...</Typography>
          </Box>
        ) : requests.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              📭 No delivery requests yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the button above to create your first request
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
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
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {request.created_at ? new Date(request.created_at).toLocaleString('en-PK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          size="small"
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

                      <Divider sx={{ my: 2 }} />

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.5 }}>
                            📍 Pickup Address
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                            {request.pickup_address}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.5 }}>
                              🏙️ City
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                              {request.pickup_city}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.5 }}>
                              📦 Parcels
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                              {request.total_parcels}
                            </Typography>
                          </Box>
                        </Box>

                        {request.parcel_weight && (
                          <Box>
                            <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.5 }}>
                              ⚖️ Weight
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                              {request.parcel_weight}
                            </Typography>
                          </Box>
                        )}

                        {request.special_instructions && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.5 }}>
                              📝 Instructions
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                              {request.special_instructions}
                            </Typography>
                          </Box>
                        )}

                        {request.admin_notes && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#e8f4f8', borderRadius: 2, border: '1px solid #b3d9e8' }}>
                            <Typography variant="caption" sx={{ color: '#0c5460', display: 'block', mb: 0.5, fontWeight: 600 }}>
                              💬 Admin Notes
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#0c5460' }}>
                              {request.admin_notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      {/* Delivery Request Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Request Parcel Delivery</Typography>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Pickup Address *"
              multiline
              rows={2}
              value={formData.pickup_address}
              onChange={handleChange('pickup_address')}
              fullWidth
              variant="outlined"
              helperText="Where should the rider pick up the parcels?"
            />
            
            <TextField
              label="Pickup City *"
              value={formData.pickup_city}
              onChange={handleChange('pickup_city')}
              fullWidth
              variant="outlined"
            />
            
            <TextField
              label="Total Parcels *"
              type="number"
              value={formData.total_parcels}
              onChange={handleChange('total_parcels')}
              fullWidth
              variant="outlined"
              helperText={`You currently have ${stats.total} parcels`}
            />
            
            <TextField
              label="Approximate Weight (Optional)"
              value={formData.parcel_weight}
              onChange={handleChange('parcel_weight')}
              fullWidth
              variant="outlined"
              placeholder="e.g., 5kg, 10kg, Light, Heavy"
            />
            
            <TextField
              label="Special Instructions (Optional)"
              multiline
              rows={3}
              value={formData.special_instructions}
              onChange={handleChange('special_instructions')}
              fullWidth
              variant="outlined"
              placeholder="Any special handling requirements or notes for the admin..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={loading}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)'
              }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MerchantDashboardHome
