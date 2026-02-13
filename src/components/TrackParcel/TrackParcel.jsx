import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Box, Card, CardContent, Typography, Stepper, Step, StepLabel, Alert } from '@mui/material'
import { LocalShipping, CheckCircle, Inventory, LocationOn } from '@mui/icons-material'
import LiveTracking from './LiveTracking'

const TrackParcel = () => {
  const navigate = useNavigate()
  const [trackingCode, setTrackingCode] = useState('')
  const [parcelData, setParcelData] = useState(null)
  const [error, setError] = useState('')
  const [showLiveTracking, setShowLiveTracking] = useState(false)

  const statusSteps = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (showLiveTracking) {
        setShowLiveTracking(false)
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    if (showLiveTracking) {
      window.history.pushState(null, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [showLiveTracking])

  const handleTrack = async () => {
    setError('')
    setParcelData(null)
    
    const code = trackingCode.trim()
    if (!code) {
      setError('Please enter a tracking code')
      return
    }

    console.log('Searching for tracking code:', code)

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/parcels/track/${code}`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('Error response:', errorData)
        throw new Error('Parcel not found')
      }
      
      const data = await response.json()
      console.log('Parcel data:', data)
      const parcel = data.data || data
      setParcelData(parcel)
      
      // Show live tracking if status is out_for_delivery
      if (parcel.parcel_status?.toLowerCase() === 'out_for_delivery') {
        setShowLiveTracking(true)
      }
    } catch (err) {
      console.error('Tracking error:', err)
      setError('Parcel not found. Please check your tracking code.')
    }
  }

  const getActiveStep = (status) => {
    const normalizedStatus = status?.toLowerCase() || ''
    const normalizedSteps = statusSteps.map(s => s.toLowerCase())
    const index = normalizedSteps.indexOf(normalizedStatus)
    return index !== -1 ? index : 0
  }

  // Show live tracking overlay when status is out_for_delivery
  if (showLiveTracking && parcelData?.parcel_status?.toLowerCase() === 'out_for_delivery') {
    return (
      <LiveTracking 
        trackingCode={parcelData.tracking_code} 
        onClose={() => setShowLiveTracking(false)} 
      />
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping /> Track Your Parcel
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Enter Tracking Code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g., TRK-123456"
            />
            <Button variant="contained" onClick={handleTrack} sx={{ minWidth: 120 }}>
              Track
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {parcelData && (
            <Box sx={{ mt: 4 }}>
              <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Parcel Details</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tracking Code</Typography>
                      <Typography variant="body1" fontWeight="bold">{parcelData.tracking_code || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">{parcelData.parcel_status || 'Pending'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Pickup Location</Typography>
                      <Typography variant="body1">{parcelData.pickup_location || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
                      <Typography variant="body1">{parcelData.client_address || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn /> Delivery Progress
              </Typography>
              <Stepper activeStep={getActiveStep(parcelData.parcel_status)} alternativeLabel sx={{ mt: 3 }}>
                {statusSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {parcelData.parcel_status === 'delivered' && (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 3 }}>
                  Your parcel has been delivered successfully!
                </Alert>
              )}

              {parcelData.parcel_status?.toLowerCase() === 'out_for_delivery' && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<LocalShipping />}
                    onClick={() => setShowLiveTracking(true)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 4,
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      }
                    }}
                  >
                    Track Live Location 🚀
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default TrackParcel
