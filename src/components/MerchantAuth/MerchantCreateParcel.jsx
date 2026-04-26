import React, { useState } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios'

const MerchantCreateParcel = ({ merchantData, onParcelCreated }) => {
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
  
  const [parcelForm, setParcelForm] = useState({
    tracking_code: 'TRK' + Date.now() + Math.floor(Math.random() * 1000),
    sender_name: '',
    sender_phone: '',
    sender_address: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    receiver_city: '',
    parcel_weight: '',
    parcel_type: '',
    delivery_charges: ''
  })

  const [errors, setErrors] = useState({})

  const validateAddress = (address, city) => {
    const addressLower = address.toLowerCase()
    const cityLower = city.toLowerCase()
    
    if (!addressLower.includes(cityLower)) {
      return `Address must include the city name "${city}"`
    }
    return null
  }

  const handleParcelSubmit = async (e) => {
    e.preventDefault()
    
    // Validate receiver address contains city name
    const addressError = validateAddress(parcelForm.receiver_address, parcelForm.receiver_city)
    if (addressError) {
      setErrors({ receiver_address: addressError })
      alert(addressError)
      return
    }
    
    setErrors({})
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/parcels', {
        ...parcelForm,
        pickup_city: parcelForm.receiver_city, // Map receiver_city to pickup_city for backend
        pickup_location: parcelForm.receiver_address, // Map receiver_address to pickup_location
        client_name: parcelForm.receiver_name,
        client_phone_number: parcelForm.receiver_phone,
        client_address: parcelForm.receiver_address,
        payment_method: 'cod', // Default payment method
        merchant_id: merchantData.id,
        merchant_name: merchantData.business_name
      })
      
      const data = response.data
      const assignedRider = data.assigned_rider_name || 'N/A'
      const aiStatus = data.ai_assignment === 'success' ? '✅ AI assigned rider' : '⚠️ No rider available'
      
      alert(`Parcel created successfully!\n\nTracking: ${data.tracking_code}\nAssigned to: ${assignedRider}\n${aiStatus}`)
      
      setParcelForm({
        tracking_code: 'TRK' + Date.now() + Math.floor(Math.random() * 1000),
        sender_name: '',
        sender_phone: '',
        sender_address: '',
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
        receiver_city: '',
        parcel_weight: '',
        parcel_type: '',
        delivery_charges: ''
      })
      if (onParcelCreated) onParcelCreated()
    } catch (error) {
      alert('Error creating parcel: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>Create New Parcel</Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>Merchant: {merchantData.business_name}</Alert>
          
          <form onSubmit={handleParcelSubmit}>
            <TextField label="Tracking Code" value={parcelForm.tracking_code} disabled fullWidth sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Sender Name" value={parcelForm.sender_name} onChange={(e) => setParcelForm({...parcelForm, sender_name: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}><TextField label="Sender Phone" value={parcelForm.sender_phone} onChange={(e) => setParcelForm({...parcelForm, sender_phone: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={12}><TextField label="Sender Address" value={parcelForm.sender_address} onChange={(e) => setParcelForm({...parcelForm, sender_address: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}><TextField label="Receiver Name" value={parcelForm.receiver_name} onChange={(e) => setParcelForm({...parcelForm, receiver_name: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}><TextField label="Receiver Phone" value={parcelForm.receiver_phone} onChange={(e) => setParcelForm({...parcelForm, receiver_phone: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={12}><TextField label="Receiver Address" value={parcelForm.receiver_address} onChange={(e) => setParcelForm({...parcelForm, receiver_address: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Receiver City</InputLabel>
                  <Select value={parcelForm.receiver_city} onChange={(e) => setParcelForm({...parcelForm, receiver_city: e.target.value})} label="Receiver City">
                    {cities.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}><TextField label="Parcel Weight (kg)" type="number" value={parcelForm.parcel_weight} onChange={(e) => setParcelForm({...parcelForm, parcel_weight: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}><TextField label="Parcel Type" value={parcelForm.parcel_type} onChange={(e) => setParcelForm({...parcelForm, parcel_type: e.target.value})} fullWidth required /></Grid>
              <Grid item xs={6}><TextField label="Delivery Charges" type="number" value={parcelForm.delivery_charges} onChange={(e) => setParcelForm({...parcelForm, delivery_charges: e.target.value})} fullWidth required /></Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" size="large" fullWidth sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 1.5 }}>Create Parcel</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default MerchantCreateParcel
