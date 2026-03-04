import React from 'react'
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material'
import { Business, Person, Email, Phone, LocationCity, Category, LocalShipping, CheckCircle, HourglassEmpty, DirectionsBike, Send } from '@mui/icons-material'
import axios from 'axios'

const MerchantDashboardHome = ({ merchantData, stats }) => {
  const handleRequestDelivery = async () => {
    if (confirm('Send delivery request to admin?')) {
      try {
        await axios.post('http://127.0.0.1:8000/api/merchant/request-delivery', {
          merchant_id: merchantData.id,
          merchant_name: merchantData.business_name,
          pickup_location: merchantData.business_name + ' Store',
          pickup_city: merchantData.city || 'N/A',
          dropoff_location: 'To be assigned',
          dropoff_city: 'Multiple locations',
          payment_method: 'cod',
          client_name: 'Admin',
          client_phone: merchantData.phone_number || 'N/A',
          client_address: 'Admin Office'
        })
        alert('✅ Delivery request sent to admin successfully!')
      } catch (error) {
        console.error('Error:', error.response?.data)
        alert('❌ Error sending request. Please try again.')
      }
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>Welcome, {merchantData.business_name}</Typography>

      {/* Profile Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>Business Profile</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><Business sx={{ mr: 1 }} /> <Typography>Business: {merchantData.business_name}</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><Person sx={{ mr: 1 }} /> <Typography>Owner: {merchantData.owner_name}</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><Email sx={{ mr: 1 }} /> <Typography>Email: {merchantData.email}</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><Phone sx={{ mr: 1 }} /> <Typography>Phone: {merchantData.phone_number}</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><LocationCity sx={{ mr: 1 }} /> <Typography>City: {merchantData.city}</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center' }}><Category sx={{ mr: 1 }} /> <Typography>Product: {merchantData.product_type}</Typography></Box></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <LocalShipping sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.total}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Total Parcels</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <HourglassEmpty sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.pending}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Pending Pickup</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <DirectionsBike sx={{ fontSize: 50, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{stats.inTransit}</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>In Transit</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
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
          onClick={handleRequestDelivery}
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
    </Box>
  )
}

export default MerchantDashboardHome
