import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Card, Avatar, TextField, Grid, Divider, Paper, Chip, IconButton } from '@mui/material'
import { Business, LocalShipping, Logout, Person, Edit, Save, Cancel, Email, Phone, LocationOn, Description, CameraAlt, CheckCircle, Assignment } from '@mui/icons-material'
import axios from 'axios'
import MerchantDashboardHome from './MerchantDashboardHome'
import MerchantCreateParcel from './MerchantCreateParcel'
import MerchantMyParcels from './MerchantMyParcels'
import MerchantMyRequests from './MerchantMyRequests'

const MerchantProfileSection = ({ profileData, merchantId, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (profileData) {
      setFormData({
        first_name: profileData.user.first_name,
        last_name: profileData.user.last_name,
        phone: profileData.user.phone,
        company_name: profileData.company?.company_name || '',
        address: profileData.company?.address || '',
        product_type: profileData.company?.product_type || ''
      })
      setImagePreview(profileData.user.profile_image)
    }
  }, [profileData])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key])
      })
      if (profileImage) submitData.append('profile_image', profileImage)

      await axios.post(`http://127.0.0.1:8000/api/merchants/${merchantId}/profile`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      onUpdate()
      setEditing(false)
      setProfileImage(null)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Animated Header Card with Particles Effect */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '32px', 
        mb: 4, 
        overflow: 'hidden',
        boxShadow: '0 25px 70px rgba(102, 126, 234, 0.4)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ p: 5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{
                position: 'absolute',
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                background: 'linear-gradient(45deg, #f093fb, #f5576c, #4facfe)',
                borderRadius: '50%',
                opacity: 0.3,
                filter: 'blur(20px)',
                animation: 'pulse 3s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.5 }
                }
              }} />
              <Avatar 
                src={imagePreview} 
                sx={{ 
                  width: 160, 
                  height: 160, 
                  border: '8px solid white',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
                  }
                }}
              >
                <Business sx={{ fontSize: 70 }} />
              </Avatar>
              {editing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3, #653a8b)',
                      transform: 'scale(1.1) rotate(15deg)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CameraAlt />
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ flex: 1, color: 'white' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                mb: 1.5, 
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.8))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {profileData?.company?.company_name || 'Merchant Profile'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 2.5, fontWeight: 400 }}>
                👤 {profileData?.user?.first_name} {profileData?.user?.last_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircle />}
                  label={profileData?.company?.approval_status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                  sx={{ 
                    background: profileData?.company?.approval_status === 'approved' 
                      ? 'linear-gradient(135deg, #4caf50, #45a049)' 
                      : 'linear-gradient(135deg, #ff9800, #f57c00)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    px: 2,
                    py: 2.5,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                />
                {profileData?.company?.is_active && (
                  <Chip 
                    label="🟢 Active"
                    sx={{ 
                      background: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      px: 2,
                      py: 2.5,
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </Box>
            </Box>

            {!editing ? (
              <Button
                variant="contained"
                onClick={() => setEditing(true)}
                sx={{
                  background: 'white',
                  color: '#667eea',
                  borderRadius: '20px',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #fff, #f5f5f5)',
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                ✏️ Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    background: 'white',
                    color: '#4caf50',
                    borderRadius: '20px',
                    px: 4,
                    py: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    '&:hover': { 
                      background: '#f5f5f5',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  💾 Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(false)
                    setImagePreview(profileData?.user?.profile_image)
                    setProfileImage(null)
                  }}
                  sx={{
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    borderRadius: '20px',
                    px: 4,
                    py: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { 
                      borderColor: 'white',
                      borderWidth: 2,
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  ❌ Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Card>

      {/* Information Cards with Enhanced Design */}
      <Grid container spacing={4}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '28px', 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '6px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 25px 70px rgba(102, 126, 234, 0.25)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '18px',
                p: 2,
                display: 'flex',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}>
                <Person sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
                  Personal Information
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                  Your personal details
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  First Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500 }}>
                    {profileData?.user?.first_name || 'N/A'}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Last Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500 }}>
                    {profileData?.user?.last_name || 'N/A'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ color: '#667eea', fontSize: 20 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block' }}>
                    Email
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500 }}>
                    {profileData?.user?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: '#667eea' }} /> Phone Number
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500, ml: 3 }}>
                    {profileData?.user?.phone || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Business Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '28px', 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
            border: '1px solid rgba(240, 147, 251, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '6px',
              background: 'linear-gradient(90deg, #f093fb, #f5576c)',
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 25px 70px rgba(240, 147, 251, 0.25)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '18px',
                p: 2,
                display: 'flex',
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}>
                <Business sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
                  Business Information
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                  Your business details
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(240, 147, 251, 0.2)' }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Company Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.company_name}
                    onChange={handleChange('company_name')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500 }}>
                    {profileData?.company?.company_name || 'N/A'}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ fontSize: 18, color: '#f5576c' }} /> Product Type
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={formData.product_type}
                    onChange={handleChange('product_type')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500, ml: 3 }}>
                    {profileData?.company?.product_type || 'N/A'}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: '#f5576c' }} /> Business Address
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleChange('address')}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500, ml: 3 }}>
                    {profileData?.company?.address || 'N/A'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ color: '#f5576c', fontSize: 20 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block' }}>
                    City
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#333', fontWeight: 500 }}>
                    {profileData?.address?.city || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

const MerchantDashboard = () => {
  const navigate = useNavigate()
  const [merchantData, setMerchantData] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 })
  const [allParcels, setAllParcels] = useState([])
  const [currentPage, setCurrentPage] = useState('profile')
  const [parcelFilter, setParcelFilter] = useState('all')
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('merchantData')
    if (!data) {
      navigate('/login')
      return
    }
    const merchant = JSON.parse(data)
    
    const fetchMerchantDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/merchants/${merchant.id}`)
        const fullData = response.data.data || response.data
        
        const merchantInfo = {
          id: fullData.id,
          business_name: fullData.company?.company_name || fullData.business_name || 'N/A',
          owner_name: `${fullData.first_name || ''} ${fullData.last_name || ''}`.trim() || fullData.owner_name || 'N/A',
          email: fullData.email || 'N/A',
          phone_number: fullData.phone || fullData.phone_number || 'N/A',
          city: fullData.address?.city || fullData.city || 'N/A',
          product_type: fullData.company?.product_type || fullData.product_type || 'N/A'
        }
        
        setMerchantData(merchantInfo)
        fetchParcels(fullData.id)
        fetchProfileData(fullData.id)
      } catch (error) {
        
        setMerchantData(merchant)
        fetchParcels(merchant.id)
        fetchProfileData(merchant.id)
      }
    }
    
    fetchMerchantDetails()
  }, [])

  const fetchProfileData = async (merchantId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/merchants/${merchantId}/profile`)
      setProfileData(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchParcels = async (merchantId) => {
    try {
      console.log('Fetching parcels for merchant ID:', merchantId)
      const response = await axios.get(`http://127.0.0.1:8000/api/merchant/${merchantId}/parcels`)
      console.log('Parcels API Response:', response.data)
      
      // Handle different response structures
      let parcels = []
      if (response.data.status && response.data.data) {
        // New format with status wrapper
        parcels = Array.isArray(response.data.data) ? response.data.data : []
      } else if (Array.isArray(response.data)) {
        // Direct array format
        parcels = response.data
      } else if (response.data.parcels && Array.isArray(response.data.parcels)) {
        // Nested parcels format
        parcels = response.data.parcels
      }
      
      console.log('Processed parcels:', parcels)
      console.log('Total parcels found:', parcels.length)
      setAllParcels(parcels)
      
      // Calculate stats with multiple status variations
      const statsData = {
        total: parcels.length,
        pending: parcels.filter(p => {
          const status = (p.status || p.parcel_status || '').toLowerCase()
          return status === 'pending' || status === 'pickup_requested'
        }).length,
        inTransit: parcels.filter(p => {
          const status = (p.status || p.parcel_status || '').toLowerCase()
          return status === 'in_transit' || status === 'picked_up' || status === 'out_for_delivery'
        }).length,
        delivered: parcels.filter(p => {
          const status = (p.status || p.parcel_status || '').toLowerCase()
          return status === 'delivered'
        }).length
      }
      
      console.log('Stats calculated:', statsData)
      console.log('Parcel statuses:', parcels.map(p => p.status || p.parcel_status))
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching parcels:', error)
      console.error('Error details:', error.response?.data || error.message)
      setAllParcels([])
      setStats({ total: 0, pending: 0, inTransit: 0, delivered: 0 })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchantToken')
    localStorage.removeItem('merchantData')
    navigate('/', { replace: true })
  }

  const handleParcelCreated = () => {
    if (merchantData) {
      fetchParcels(merchantData.id)
    }
  }

  const handleViewParcels = (filter) => {
    setParcelFilter(filter)
    setCurrentPage('parcels')
  }

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard')
  }

  if (!merchantData) return null

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box sx={{ width: 280, bgcolor: '#34495e', color: 'white', p: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: '#2c3e50' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>Merchant Panel</Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mb: 0.5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              bgcolor: currentPage === 'profile' ? 'rgba(52, 152, 219, 0.3)' : 'transparent'
            }} 
            startIcon={<Person />}
            onClick={() => setCurrentPage('profile')}
          >
            My Profile
          </Button>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mb: 0.5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, 
              bgcolor: currentPage === 'dashboard' ? 'rgba(52, 152, 219, 0.3)' : 'transparent' 
            }} 
            startIcon={<Business />}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mb: 0.5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              bgcolor: currentPage === 'parcels' ? 'rgba(52, 152, 219, 0.3)' : 'transparent'
            }} 
            startIcon={<LocalShipping />}
            onClick={() => setCurrentPage('parcels')}
          >
            My Parcels
          </Button>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mt: 5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.2)' } 
            }} 
            startIcon={<Logout />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {currentPage === 'dashboard' && <MerchantDashboardHome merchantData={merchantData} stats={stats} onViewParcels={handleViewParcels} />}
        {currentPage === 'parcels' && <MerchantMyParcels parcels={allParcels} filter={parcelFilter} onBack={handleBackToDashboard} />}
        {currentPage === 'profile' && (
          profileData ? (
            <MerchantProfileSection 
              profileData={profileData} 
              merchantId={merchantData.id}
              onUpdate={() => fetchProfileData(merchantData.id)}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#7f8c8d' }}>Loading Profile...</Typography>
              <Typography sx={{ color: '#95a5a6' }}>Please wait while we fetch your information</Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  )
}

export default MerchantDashboard
