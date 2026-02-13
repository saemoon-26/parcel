import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Chip,
  Paper
} from '@mui/material'
import { ExitToApp, Person, LocalShipping } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const RiderDashboard = () => {
  const navigate = useNavigate()
  const [riderData, setRiderData] = useState(null)

  useEffect(() => {
    // Get rider data from localStorage
    const savedRiderData = localStorage.getItem('riderData')
    if (savedRiderData) {
      setRiderData(JSON.parse(savedRiderData))
    } else {
      // Redirect to login if no data found
      navigate('/rider/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('riderToken')
    localStorage.removeItem('riderData')
    navigate('/rider/login')
  }

  if (!riderData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Welcome, {riderData.full_name}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rider Dashboard
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              color="error"
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      0
                    </Typography>
                    <Typography variant="body2">
                      Total Deliveries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h2" sx={{ mr: 2 }}>💰</Typography>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Rs. 0
                    </Typography>
                    <Typography variant="body2">
                      Total Earnings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h2" sx={{ mr: 2 }}>⭐</Typography>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      5.0
                    </Typography>
                    <Typography variant="body2">
                      Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Profile Info */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Profile Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{riderData.email}</Typography>
                
                <Typography variant="body2" color="text.secondary">Mobile</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{riderData.mobile_primary}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip 
                  label="Active" 
                  color="success" 
                  sx={{ mb: 2 }} 
                />
                
                <Typography variant="body2" color="text.secondary">Member Since</Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default RiderDashboard