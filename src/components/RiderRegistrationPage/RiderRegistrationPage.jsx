import { useState, useRef, useEffect, memo, useMemo } from 'react'
import { TextField, Button, Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Stepper, Step, StepLabel, Avatar, Divider, IconButton, InputAdornment } from '@mui/material'
import { CloudUpload, Person, DirectionsCar, Description, AccountBalance, LocationOn, Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Import images
import img1 from '../../images/WhatsApp Image 2026-04-22 at 12.15.09 AM.jpeg'
import img2 from '../../images/WhatsApp Image 2026-04-22 at 12.15.32 AM.jpeg'
import img3 from '../../images/WhatsApp Image 2026-04-22 at 12.15.49 AM.jpeg'
import img4 from '../../images/WhatsApp Image 2026-04-22 at 12.19.12 AM.jpeg'
import img5 from '../../images/WhatsApp Image 2026-04-22 at 12.20.16 AM.jpeg'
import img6 from '../../images/WhatsApp Image 2026-04-22 at 12.20.28 AM.jpeg'
import img7 from '../../images/WhatsApp Image 2026-04-22 at 12.20.55 AM.jpeg'
import img8 from '../../images/WhatsApp Image 2026-04-22 at 12.21.45 AM.jpeg'
import img9 from '../../images/WhatsApp Image 2026-04-22 at 12.39.09 AM.jpeg'
import img10 from '../../images/WhatsApp Image 2026-04-22 at 12.39.20 AM.jpeg'
import img11 from '../../images/WhatsApp Image 2026-04-22 at 12.39.34 AM.jpeg'
import img12 from '../../images/WhatsApp Image 2026-04-22 at 12.39.49 AM.jpeg'
import img13 from '../../images/WhatsApp Image 2026-04-22 at 12.40.38 AM.jpeg'

const VEHICLE_TYPES = ['Bike', 'Car', 'Van']
const VEHICLE_BRANDS = ['Honda', 'Suzuki', 'Toyota', 'Yamaha', 'KTM', 'United', 'Changan', 'Hyundai', 'Kia', 'Daihatsu']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const STATES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory']
const COUNTRIES = ['Pakistan', 'India', 'Bangladesh', 'Afghanistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE', 'Saudi Arabia']
const BANKS = ['HBL', 'UBL', 'MCB', 'Allied Bank', 'Bank Alfalah', 'Meezan Bank', 'Faysal Bank', 'Askari Bank', 'Standard Chartered', 'Bank Al Habib', 'Soneri Bank', 'Silk Bank', 'JS Bank', 'Dubai Islamic Bank', 'Samba Bank']

const SLIDER_IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13]

const RiderRegistrationPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
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
    state: '',
    country: '',
    zipcode: ''
  })

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleFieldChange = (field) => (e) => {
    let value = e.target.value

    // Validate name fields - only letters and spaces
    if (field === 'full_name' || field === 'father_name' || field === 'account_title') {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        alert('⚠️ Only alphabets and spaces are allowed in name fields')
        return
      }
    }

    // Auto-format CNIC - exactly 13 digits
    if (field === 'cnic_number') {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 13) {
        value = digits
        if (digits.length > 5) value = digits.slice(0, 5) + '-' + digits.slice(5)
        if (digits.length > 12) value = value.slice(0, 13) + '-' + digits.slice(12)
      } else {
        return
      }
    }

    // Auto-format mobile numbers - exactly 11 digits
    if (field === 'mobile_primary' || field === 'mobile_alternate') {
      const digits = value.replace(/\D/g, '')
      if (digits.length > 11) {
        alert('⚠️ Mobile number must be exactly 11 digits')
        return
      }
      value = digits
    }

    // Format account number - only digits
    if (field === 'account_number') {
      if (value && !/^\d*$/.test(value)) {
        alert('⚠️ Only numbers are allowed in account number')
        return
      }
    }

    // Format zipcode - only digits
    if (field === 'zipcode') {
      value = value.replace(/\D/g, '').slice(0, 6)
    }

    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field) => (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }))
      setUploadStatus(prev => ({ ...prev, [field]: `✓ ${file.name}` }))
    }
  }

  const handleSubmit = async () => {
    // Quick validation
    if (!formData.full_name?.trim()) return alert('❌ Full Name required!')
    if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) return alert('⚠️ Full name: only alphabets and spaces allowed!')
    if (!formData.father_name?.trim()) return alert('❌ Father Name required!')
    if (!/^[a-zA-Z\s]+$/.test(formData.father_name)) return alert('⚠️ Father name: only alphabets and spaces allowed!')
    
    // Validate CNIC - exactly 13 digits
    if (!formData.cnic_number?.trim()) return alert('❌ CNIC required!')
    const cnicDigits = formData.cnic_number.replace(/\D/g, '')
    if (cnicDigits.length !== 13) return alert('⚠️ CNIC must be exactly 13 digits (e.g., 12345-1234567-1)')
    
    if (!formData.mobile_primary?.trim()) return alert('❌ Mobile required!')
    if (!/^03\d{9}$/.test(formData.mobile_primary)) return alert('⚠️ Mobile: 11 digits, start with 03!')
    
    if (formData.mobile_alternate && !/^03\d{9}$/.test(formData.mobile_alternate)) {
      return alert('⚠️ Alternate mobile: 11 digits, start with 03!')
    }
    
    if (!formData.email?.trim()) return alert('❌ Email required!')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert('⚠️ Invalid email format!')
    if (!formData.password?.trim()) return alert('❌ Password required!')
    if (formData.password.length < 6) return alert('⚠️ Password: minimum 6 characters!')
    if (!formData.address?.trim()) return alert('❌ Address required!')
    if (!formData.vehicle_type) return alert('❌ Vehicle Type required!')
    if (!formData.vehicle_brand) return alert('❌ Vehicle Brand required!')
    if (!formData.vehicle_registration?.trim()) return alert('❌ Vehicle Registration required!')
    if (!formData.driving_license_number?.trim()) return alert('❌ Driving License required!')
    if (!formData.city) return alert('❌ City required!')
    if (!formData.state) return alert('❌ State required!')
    if (!formData.country) return alert('❌ Country required!')
    if (!formData.zipcode?.trim()) return alert('❌ Zipcode required!')
    if (!/^\d{4,6}$/.test(formData.zipcode)) return alert('⚠️ Zipcode: 4-6 digits only!')
    
    // Validate account title if provided
    if (formData.account_title && !/^[a-zA-Z\s]+$/.test(formData.account_title)) {
      return alert('⚠️ Account title: only alphabets and spaces allowed!')
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
      formDataToSend.append('country', formData.country)
      formDataToSend.append('zipcode', formData.zipcode)
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
      


      for (let [key, value] of formDataToSend.entries()) {

      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/rider-registrations', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      alert('Registration submitted successfully! Your application is under review. Please login to continue.')
      navigate('/login')
    } catch (error) {
      
      
      
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

  const backgroundStyle = useMemo(() => ({
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    py: 4,
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' }
    }
  }), [])

  return (
    <Box sx={backgroundStyle}>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Paper elevation={10} sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          minHeight: '400px'
        }}>
          {/* Image Slider Background */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0
          }}>
            {SLIDER_IMAGES.map((img, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: currentSlide === index ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  filter: 'brightness(0.5)',
                  transform: 'scale(1.2)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)'
                  }
                }}
              />
            ))}
          </Box>


          {/* Slide Indicators */}
          <Box sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 3
          }}>
            {SLIDER_IMAGES.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: currentSlide === index ? 30 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: currentSlide === index 
                    ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)' 
                    : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: currentSlide === index ? '0 0 20px rgba(255, 255, 255, 0.8)' : 'none',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.8)',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ textAlign: 'center', mb: 3, position: 'relative', zIndex: 2 }}>
            <Avatar sx={{ 
              width: 90, 
              height: 90, 
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              boxShadow: '0 15px 50px rgba(255, 255, 255, 0.6)',
              fontSize: '3rem'
            }}>
              🚴
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(102, 126, 234, 0.6)'
            }}>
              Rider Registration
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#fff',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
              fontWeight: 500
            }}>
              Join our delivery team and start earning today! 🚀💰
            </Typography>
          </Box>
          
          <Stepper alternativeLabel sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
            {['Personal Info', 'Vehicle Details', 'Documents', 'Bank & Location'].map((label) => (
              <Step key={label} active>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper elevation={10} sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          zIndex: 1
        }}>
          <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={8} sx={{ 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e3f2fd',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(33, 150, 243, 0.3)'
              }
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
                      helperText="Only letters and spaces allowed"
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
                      helperText="Only letters and spaces allowed"
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
                      helperText="Exactly 13 digits required"
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
                      helperText="11 digits starting with 03"
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
                      helperText="11 digits starting with 03"
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleFieldChange('password')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      helperText="Minimum 6 characters required"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
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
              border: '1px solid #e8f5e8',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(76, 175, 80, 0.3)'
              }
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
              border: '1px solid #f3e5f5',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(156, 39, 176, 0.3)'
              }
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
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Bank Name</InputLabel>
                      <Select 
                        value={formData.bank_name}
                        onChange={handleFieldChange('bank_name')} 
                        label="Bank Name"
                      >
                        {BANKS.map(bank => <MenuItem key={bank} value={bank}>{bank}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Account Number"
                      value={formData.account_number}
                      onChange={handleFieldChange('account_number')}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      helperText="Only digits allowed"
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
                      helperText="Only letters and spaces allowed"
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
                    <FormControl fullWidth sx={{ mb: 2 }}>
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
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Country *</InputLabel>
                      <Select 
                        value={formData.country}
                        onChange={handleFieldChange('country')} 
                        label="Country *"
                      >
                        {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Zipcode *"
                      placeholder="38000"
                      value={formData.zipcode}
                      onChange={handleFieldChange('zipcode')}
                      fullWidth
                      variant="outlined"
                      helperText="4-6 digits only"
                    />
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
              border: '1px solid #fff3e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(255, 152, 0, 0.3)'
              }
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

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            size="large"
            disabled={loading}
            sx={{ 
              px: 10, 
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 3,
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 28px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Submitting Registration...' : '🚀 Submit Registration'}
          </Button>
        </Box>

        </Paper>
      </Box>
    </Box>
  )
}

export default RiderRegistrationPage
