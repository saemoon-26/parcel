import { useState } from 'react'
import { TextField, Button, Box, Typography, Paper, Grid, Card, CardContent, Avatar, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { CloudUpload, Business, AccountBalance, LocationOn } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const PRODUCT_TYPES = ['Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Cosmetics', 'Furniture', 'Jewelry', 'Sports Equipment', 'Toys', 'Other']

const MerchantRegistrationPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone_number: '',
    password: '',
    full_address: '',
    city: '',
    postal_code: '',
    bank_name: '',
    account_number: '',
    product_type: '',
    avg_parcels_per_day: '',
    business_document: null
  })

  const handleFieldChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }))
      setUploadStatus(prev => ({ ...prev, [field]: `✓ ${file.name}` }))
    }
  }

  const handleSubmit = async () => {
    const requiredFields = {
      business_name: 'Business Name',
      owner_name: 'Owner Name',
      email: 'Email',
      phone_number: 'Phone Number',
      password: 'Password',
      full_address: 'Full Address',
      city: 'City',
      postal_code: 'Postal Code',
      business_document: 'Business Document'
    }
    
    const missingFields = []
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        missingFields.push(requiredFields[field])
      }
    })
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }
    
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      
      formDataToSend.append('business_name', formData.business_name)
      formDataToSend.append('owner_name', formData.owner_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('full_address', formData.full_address)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('postal_code', formData.postal_code)
      formDataToSend.append('bank_name', formData.bank_name || '')
      formDataToSend.append('account_number', formData.account_number || '')
      formDataToSend.append('product_type', formData.product_type || '')
      formDataToSend.append('avg_parcels_per_day', formData.avg_parcels_per_day || 0)
      
      if (formData.business_document) {
        formDataToSend.append('business_document', formData.business_document)
      }
      
      const response = await axios.post('http://localhost:8000/api/merchant-registrations', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      alert('Registration submitted successfully! Your application is under review.')
      navigate('/merchant/login')
    } catch (error) {
      console.error('Error registering merchant:', error)
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.keys(errors).map(field => 
          `${field}: ${errors[field].join(', ')}`
        ).join('\n')
        alert(`Validation Errors:\n${errorMessages}`)
      } else if (error.response?.data?.message) {
        alert(`Registration failed: ${error.response.data.message}`)
      } else {
        alert(`Registration failed: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Paper elevation={10} sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              🏪
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Merchant Registration
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Register your business and start shipping with us!
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={8} sx={{ 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e3f2fd'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)'
                  }}>
                    <Business />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Business Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Business Name *"
                      value={formData.business_name}
                      onChange={handleFieldChange('business_name')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Owner Name *"
                      value={formData.owner_name}
                      onChange={handleFieldChange('owner_name')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Email Address *"
                      type="email"
                      value={formData.email}
                      onChange={handleFieldChange('email')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Phone Number *"
                      placeholder="03001234567"
                      value={formData.phone_number}
                      onChange={handleFieldChange('phone_number')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Password *"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleFieldChange('password')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      helperText="Password will be used for login after approval"
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Product Type</InputLabel>
                      <Select 
                        value={formData.product_type}
                        onChange={handleFieldChange('product_type')} 
                        label="Product Type"
                      >
                        {PRODUCT_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Average Parcels Per Day"
                      type="number"
                      value={formData.avg_parcels_per_day}
                      onChange={handleFieldChange('avg_parcels_per_day')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ 
                        height: '56px',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        color: uploadStatus.business_document ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.business_document || 'Business Document *'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={handleFileChange('business_document')}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={8} sx={{ 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e8f5e8'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
                  }}>
                    <LocationOn />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    Pickup Address
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Full Address *"
                      value={formData.full_address}
                      onChange={handleFieldChange('full_address')}
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>City *</InputLabel>
                      <Select 
                        value={formData.city}
                        onChange={handleFieldChange('city')} 
                        label="City *"
                      >
                        {CITIES.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Postal Code *"
                      value={formData.postal_code}
                      onChange={handleFieldChange('postal_code')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                  }}>
                    <AccountBalance />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    Bank Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Bank Name"
                      placeholder="HBL, UBL, etc."
                      value={formData.bank_name}
                      onChange={handleFieldChange('bank_name')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Account Number"
                      value={formData.account_number}
                      onChange={handleFieldChange('account_number')}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={10} sx={{ 
          mt: 4, 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            size="large"
            disabled={loading}
            sx={{ 
              px: 8, 
              py: 2,
              fontSize: '1.2rem',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? 'Submitting Registration...' : '🚀 Submit Registration'}
          </Button>
        </Paper>
      </Box>
    </Box>
  )
}

export default MerchantRegistrationPage
