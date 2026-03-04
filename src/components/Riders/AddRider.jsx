import React, { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material'
import { PersonAdd } from '@mui/icons-material'
import axios from 'axios'

const VEHICLE_TYPES = ['Bike', 'Car', 'Van']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const STATES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory']

const AddRider = () => {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    email: '',
    phone: '',
    cnic: '',
    license: '',
    address: '',
    city: '',
    state: '',
    vehicleType: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form Data State:', formData)
    
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.cnic || !formData.license || !formData.address || !formData.state) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const riderData = {
        full_name: formData.name,
        father_name: formData.fatherName || 'N/A',
        email: formData.email,
        password: 'rider123',
        mobile_primary: formData.phone,
        cnic_number: formData.cnic,
        driving_license_number: formData.license,
        vehicle_type: formData.vehicleType || 'Bike',
        city: formData.city,
        state: formData.state,
        address: formData.address
      }
      
      console.log('Sending data:', riderData)
      const response = await axios.post('http://127.0.0.1:8000/api/rider-registrations', riderData)
      console.log('Response:', response.data)
      alert('Rider added successfully!')
      
      setFormData({
        name: '',
        fatherName: '',
        email: '',
        phone: '',
        cnic: '',
        license: '',
        address: '',
        city: '',
        state: '',
        vehicleType: ''
      })
    } catch (error) {
      console.error('Error adding rider:', error.response?.data)
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || error.message
      alert(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Box display="flex" alignItems="center" mb={3}>
        <PersonAdd sx={{ mr: 2, color: '#1976d2' }} />
        <Typography variant="h5" component="h2">
          Add New Rider (Manual)
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name *"
                  value={formData.name}
                  onChange={handleChange('name')}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Father Name"
                  value={formData.fatherName}
                  onChange={handleChange('fatherName')}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="CNIC Number *"
                  value={formData.cnic}
                  onChange={handleChange('cnic')}
                  placeholder="12345-1234567-1"
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Driving License *"
                  value={formData.license}
                  onChange={handleChange('license')}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Address *"
                  value={formData.address}
                  onChange={handleChange('address')}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>City *</InputLabel>
                  <Select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    label="City *"
                  >
                    {CITIES.map(city => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>State *</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    label="State *"
                  >
                    {STATES.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                    label="Vehicle Type"
                  >
                    {VEHICLE_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setFormData({
                      name: '',
                      fatherName: '',
                      email: '',
                      phone: '',
                      cnic: '',
                      license: '',
                      address: '',
                      city: '',
                      state: '',
                      vehicleType: ''
                    })}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Adding...' : 'Add Rider'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3, p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> This form is for manually adding riders by admin. 
          For complete rider registration with documents, riders should use the public registration form.
        </Typography>
      </Paper>
    </div>
  )
}

export default AddRider