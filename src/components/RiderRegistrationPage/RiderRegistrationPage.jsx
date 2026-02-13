import { useState, useRef } from 'react'
import { TextField, Button, Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Stepper, Step, StepLabel, Avatar, Divider } from '@mui/material'
import { CloudUpload, Person, DirectionsCar, Description, AccountBalance, LocationOn } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const VEHICLE_TYPES = ['Bike', 'Car', 'Van']
const VEHICLE_BRANDS = ['Honda', 'Suzuki', 'Toyota', 'Yamaha', 'KTM', 'United', 'Changan', 'Hyundai', 'Kia', 'Daihatsu']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const STATES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory']

const RiderRegistrationPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    cnic_number: '',
    mobile_primary: '',
    mobile_alternate: '',
    email: '',
    password: '',
    address: '',
    profile_picture: null,
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_registration: '',
    vehicle_registration_book: null,
    vehicle_image: null,
    cnic_front_image: null,
    cnic_back_image: null,
    driving_license_number: '',
    driving_license_image: null,
    electricity_bill: null,
    bank_name: '',
    account_number: '',
    account_title: '',
    city: '',
    state: ''
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
      full_name: 'Full Name',
      father_name: 'Father/Guardian Name',
      cnic_number: 'CNIC Number',
      mobile_primary: 'Primary Mobile',
      email: 'Email',
      password: 'Password',
      address: 'Address',
      vehicle_type: 'Vehicle Type',
      vehicle_brand: 'Vehicle Brand',
      vehicle_registration: 'Vehicle Registration',
      driving_license_number: 'Driving License Number',
      city: 'City',
      state: 'State'
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
      
      // Only send fields that match database columns exactly
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('father_name', formData.father_name || '')
      formDataToSend.append('cnic_number', formData.cnic_number || '')
      formDataToSend.append('mobile_primary', formData.mobile_primary)
      formDataToSend.append('mobile_alternate', formData.mobile_alternate || '')
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('vehicle_type', formData.vehicle_type)
      formDataToSend.append('vehicle_brand', formData.vehicle_brand)
      formDataToSend.append('vehicle_model', formData.vehicle_model || '')
      formDataToSend.append('vehicle_registration', formData.vehicle_registration)
      formDataToSend.append('driving_license_number', formData.driving_license_number)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('state', formData.state)
      formDataToSend.append('bank_name', formData.bank_name || '')
      formDataToSend.append('account_number', formData.account_number || '')
      formDataToSend.append('account_title', formData.account_title || '')
      
      // Add files if selected
      if (formData.profile_picture) formDataToSend.append('profile_picture', formData.profile_picture)
      if (formData.vehicle_registration_book) formDataToSend.append('vehicle_registration_book', formData.vehicle_registration_book)
      if (formData.vehicle_image) formDataToSend.append('vehicle_image', formData.vehicle_image)
      if (formData.cnic_front_image) formDataToSend.append('cnic_front_image', formData.cnic_front_image)
      if (formData.cnic_back_image) formDataToSend.append('cnic_back_image', formData.cnic_back_image)
      if (formData.driving_license_image) formDataToSend.append('driving_license_image', formData.driving_license_image)
      if (formData.electricity_bill) formDataToSend.append('electricity_bill', formData.electricity_bill)
      
      console.log('Sending to API...')
      console.log('FormData contents:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value)
      }
      
      const response = await axios.post('http://localhost:8000/api/rider-registrations', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      const checkStatus = window.confirm(
        'Registration submitted successfully! Your application is under review.\n\n' +
        'Click OK to check your status now, or Cancel to go to login page.'
      )
      
      if (checkStatus) {
        navigate('/rider/status')
      } else {
        navigate('/rider/login')
      }
    } catch (error) {
      console.error('Error registering rider:', error)
      console.error('Error response:', error.response)
      
      // Show detailed validation errors
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
              🚴
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Rider Registration
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join our delivery team and start earning today!
            </Typography>
          </Box>
          
          <Stepper alternativeLabel sx={{ mb: 3 }}>
            {['Personal Info', 'Vehicle Details', 'Documents', 'Bank & Location'].map((label) => (
              <Step key={label} active>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
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
                    <Person />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Personal Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Full Name *"
                      value={formData.full_name}
                      onChange={handleFieldChange('full_name')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Father / Guardian Name *"
                      value={formData.father_name}
                      onChange={handleFieldChange('father_name')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="CNIC Number *"
                      placeholder="12345-1234567-1"
                      value={formData.cnic_number}
                      onChange={handleFieldChange('cnic_number')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Mobile Number (Primary) *"
                      placeholder="03001234567"
                      value={formData.mobile_primary}
                      onChange={handleFieldChange('mobile_primary')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Alternate Mobile Number"
                      placeholder="03001234567"
                      value={formData.mobile_alternate}
                      onChange={handleFieldChange('mobile_alternate')}
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
                    <TextField
                      label="Address *"
                      value={formData.address}
                      onChange={handleFieldChange('address')}
                      fullWidth
                      multiline
                      rows={3}
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
                        color: uploadStatus.profile_picture ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.profile_picture || 'Profile Picture'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange('profile_picture')}
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
                    <DirectionsCar />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    Vehicle Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Vehicle Type *</InputLabel>
                      <Select 
                        value={formData.vehicle_type}
                        onChange={handleFieldChange('vehicle_type')} 
                        label="Vehicle Type *"
                      >
                        {VEHICLE_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Vehicle Brand *</InputLabel>
                      <Select 
                        value={formData.vehicle_brand}
                        onChange={handleFieldChange('vehicle_brand')} 
                        label="Vehicle Brand *"
                      >
                        {VEHICLE_BRANDS.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Vehicle Model *"
                      placeholder="CD 70, Civic, etc."
                      value={formData.vehicle_model}
                      onChange={handleFieldChange('vehicle_model')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Vehicle Registration Number *"
                      placeholder="ABC-123"
                      value={formData.vehicle_registration}
                      onChange={handleFieldChange('vehicle_registration')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Driving License Number *"
                      value={formData.driving_license_number}
                      onChange={handleFieldChange('driving_license_number')}
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
                        mb: 2,
                        color: uploadStatus.vehicle_registration_book ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.vehicle_registration_book || 'Vehicle Registration Book'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={handleFileChange('vehicle_registration_book')}
                      />
                    </Button>
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
                        color: uploadStatus.vehicle_image ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.vehicle_image || 'Vehicle Image'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange('vehicle_image')}
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
              border: '1px solid #f3e5f5'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
                  }}>
                    <AccountBalance />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    Bank & Location
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
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Account Title"
                      value={formData.account_title}
                      onChange={handleFieldChange('account_title')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 3 }}
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
                    <FormControl fullWidth>
                      <InputLabel>State *</InputLabel>
                      <Select 
                        value={formData.state}
                        onChange={handleFieldChange('state')} 
                        label="State *"
                      >
                        {STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                      </Select>
                    </FormControl>
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
              border: '1px solid #fff3e0'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
                  }}>
                    <Description />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    Required Documents
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
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
                        mb: 2,
                        color: uploadStatus.cnic_front_image ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.cnic_front_image || 'CNIC Front Image *'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange('cnic_front_image')}
                      />
                    </Button>
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
                        mb: 2,
                        color: uploadStatus.cnic_back_image ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.cnic_back_image || 'CNIC Back Image *'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange('cnic_back_image')}
                      />
                    </Button>
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
                        mb: 2,
                        color: uploadStatus.driving_license_image ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.driving_license_image || 'Driving License Image *'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange('driving_license_image')}
                      />
                    </Button>
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
                        mb: 2,
                        color: uploadStatus.electricity_bill ? 'green' : 'inherit'
                      }}
                    >
                      {uploadStatus.electricity_bill || 'Electricity Bill *'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={handleFileChange('electricity_bill')}
                      />
                    </Button>
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

export default RiderRegistrationPage