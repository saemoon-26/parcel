import { useState, useEffect, memo, useMemo } from 'react'
import { TextField, Button, Box, Typography, Paper, Grid, Card, CardContent, Avatar, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { CloudUpload, Business, AccountBalance, LocationOn } from '@mui/icons-material'
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

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const STATES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory']
const COUNTRIES = ['Pakistan', 'India', 'Bangladesh', 'Afghanistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE', 'Saudi Arabia']
const PRODUCT_TYPES = ['Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Cosmetics', 'Furniture', 'Jewelry', 'Sports Equipment', 'Toys', 'Other']

const SLIDER_IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13]

const MerchantRegistrationPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone_number: '',
    password: '',
    full_address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    product_type: '',
    business_document: null
  })

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value
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
    if (!formData.business_name?.trim()) return alert('❌ Business Name required!')
    if (!/^[a-zA-Z\s]+$/.test(formData.business_name)) return alert('❌ Business Name: letters only!')
    if (!formData.owner_name?.trim()) return alert('❌ Owner Name required!')
    if (!/^[a-zA-Z\s]+$/.test(formData.owner_name)) return alert('❌ Owner Name: letters only!')
    if (!formData.email?.trim()) return alert('❌ Email required!')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert('❌ Invalid email!')
    if (!formData.phone_number?.trim()) return alert('❌ Phone Number required!')
    if (!/^03\d{9}$/.test(formData.phone_number)) return alert('❌ Phone: 11 digits, start with 03!')
    if (!formData.password?.trim()) return alert('❌ Password required!')
    if (formData.password.length < 6) return alert('❌ Password: min 6 chars!')
    if (!formData.full_address?.trim()) return alert('❌ Address required!')
    if (!formData.city) return alert('❌ City required!')
    if (!formData.postal_code?.trim()) return alert('❌ Postal Code required!')
    if (!/^\d{4,6}$/.test(formData.postal_code)) return alert('❌ Postal Code: 4-6 digits only!')
    if (!formData.business_document) return alert('❌ Business Document required!')
    
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
      formDataToSend.append('state', formData.state || '')
      formDataToSend.append('country', formData.country || '')
      formDataToSend.append('postal_code', formData.postal_code)
      formDataToSend.append('product_type', formData.product_type || '')
      
      if (formData.business_document) {
        formDataToSend.append('business_document', formData.business_document)
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/merchant-registrations', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      alert('Registration submitted successfully! Your application is under review.')
      navigate('/login')
    } catch (error) {
      
      
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
                  opacity: currentSlide === index ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  filter: 'brightness(0.4)',
                  transform: 'scale(1.2)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)'
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
              🏪
            </Avatar>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(102, 126, 234, 0.6)'
            }}>
              Merchant Registration
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#fff',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
              fontWeight: 500
            }}>
              Register your business and start shipping with us! 🚀📦💼
            </Typography>
          </Box>
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
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 30px rgba(33, 150, 243, 0.4)'
              }
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
              border: '1px solid #e8f5e8',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 30px rgba(76, 175, 80, 0.4)'
              }
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
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>State</InputLabel>
                      <Select 
                        value={formData.state}
                        onChange={handleFieldChange('state')} 
                        label="State"
                      >
                        {STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Country</InputLabel>
                      <Select 
                        value={formData.country}
                        onChange={handleFieldChange('country')} 
                        label="Country"
                      >
                        {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
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
                    />
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

export default MerchantRegistrationPage
