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

const AddRider = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    vehicleType: '',
    status: 'Active'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone || !formData.city) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const riderData = {
        full_name: formData.name,
        email: formData.email,
        mobile_primary: formData.phone,
        city: formData.city,
        vehicle_type: formData.vehicleType || 'Bike',
        status: formData.status
      }
      
      await axios.post('http://127.0.0.1:8000/api/riders', riderData)
      alert('Rider added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        vehicleType: '',
        status: 'Active'
      })
    } catch (error) {
      console.error('Error adding rider:', error)
      alert(`Error adding rider: ${error.response?.data?.message || error.message}`)
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
                <FormControl fullWidth required>
                  <InputLabel>City *</InputLabel>
                  <Select
                    value={formData.city}
                    onChange={handleChange('city')}
                    label="City *"
                  >
                    {CITIES.map(city => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={formData.vehicleType}
                    onChange={handleChange('vehicleType')}
                    label="Vehicle Type"
                  >
                    {VEHICLE_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleChange('status')}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
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
                      email: '',
                      phone: '',
                      city: '',
                      vehicleType: '',
                      status: 'Active'
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