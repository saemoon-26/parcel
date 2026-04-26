import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Box, Button, TextField, Typography, Paper, Grid, IconButton, CircularProgress } from '@mui/material'
import { Edit, Save, Cancel, Person, Phone, Email, Home, CreditCard, DirectionsCar, AccountBalance } from '@mui/icons-material'
import axios from 'axios'

const RiderProfile = () => {
  const navigate = useNavigate()
  const [riderData, setRiderData] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    email: '',
    mobile_primary: '',
    mobile_alternate: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_registration: '',
    driving_license_number: '',
    bank_name: '',
    account_number: '',
    account_title: ''
  })

  useEffect(() => {
    const storedRiderData = localStorage.getItem('riderData')
    if (!storedRiderData) {
      navigate('/login')
      return
    }
    const rider = JSON.parse(storedRiderData)
    fetchRiderDetails(rider.user_id || rider.id)
  }, [])

  const fetchRiderDetails = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/rider-registrations`)
      const allRiders = response.data.data || response.data
      const currentRider = allRiders.find(r => r.user_id === userId || r.id === userId)
      
      if (currentRider) {
        setRiderData(currentRider)
        setFormData({
          full_name: currentRider.full_name || '',
          father_name: currentRider.father_name || '',
          email: currentRider.email || '',
          mobile_primary: currentRider.mobile_primary || '',
          mobile_alternate: currentRider.mobile_alternate || '',
          address: currentRider.address || '',
          city: currentRider.city || '',
          state: currentRider.state || '',
          zipcode: currentRider.zipcode || '',
          vehicle_type: currentRider.vehicle?.vehicle_type || currentRider.vehicle_type || '',
          vehicle_brand: currentRider.vehicle?.vehicle_brand || currentRider.vehicle_brand || '',
          vehicle_model: currentRider.vehicle?.vehicle_model || currentRider.vehicle_model || '',
          vehicle_registration: currentRider.vehicle?.vehicle_registration || currentRider.vehicle_registration || '',
          driving_license_number: currentRider.driving_license_number || '',
          bank_name: currentRider.bank?.bank_name || currentRider.bank_name || '',
          account_number: currentRider.bank?.account_number || currentRider.account_number || '',
          account_title: currentRider.bank?.account_title || currentRider.account_title || ''
        })
      }
    } catch (error) {
      console.error('Error fetching rider details:', error)
      alert('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formDataToSend = new FormData()
      
      // Laravel PUT method workaround for multipart/form-data
      formDataToSend.append('_method', 'PUT')
      
      // Split full_name into first_name and last_name
      const nameParts = formData.full_name.split(' ')
      formDataToSend.append('first_name', nameParts[0] || '')
      formDataToSend.append('last_name', nameParts.slice(1).join(' ') || '')
      
      // Add other fields
      Object.keys(formData).forEach(key => {
        if (key !== 'full_name') {
          formDataToSend.append(key, formData[key] || '')
        }
      })
      
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture)
      }

      await axios.post(`http://127.0.0.1:8000/api/riders/${riderData.user_id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      alert('✅ Profile updated successfully!')
      setEditMode(false)
      setProfilePicture(null)
      setPreviewUrl(null)
      fetchRiderDetails(riderData.user_id || riderData.id)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('❌ Failed to update profile: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setProfilePicture(null)
    setPreviewUrl(null)
    setFormData({
      full_name: riderData.full_name || '',
      father_name: riderData.father_name || '',
      email: riderData.email || '',
      mobile_primary: riderData.mobile_primary || '',
      mobile_alternate: riderData.mobile_alternate || '',
      address: riderData.address || '',
      city: riderData.city || '',
      state: riderData.state || '',
      zipcode: riderData.zipcode || '',
      vehicle_type: riderData.vehicle?.vehicle_type || riderData.vehicle_type || '',
      vehicle_brand: riderData.vehicle?.vehicle_brand || riderData.vehicle_brand || '',
      vehicle_model: riderData.vehicle?.vehicle_model || riderData.vehicle_model || '',
      vehicle_registration: riderData.vehicle?.vehicle_registration || riderData.vehicle_registration || '',
      driving_license_number: riderData.driving_license_number || '',
      bank_name: riderData.bank?.bank_name || riderData.bank_name || '',
      account_number: riderData.bank?.account_number || riderData.account_number || '',
      account_title: riderData.bank?.account_title || riderData.account_title || ''
    })
  }

  const getProfilePicture = () => {
    if (previewUrl) return previewUrl
    const profileDoc = riderData?.documents?.find(doc => doc.document_type === 'profile_picture')
    return profileDoc ? `http://127.0.0.1:8000/storage/${profileDoc.document_path}` : null
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button variant="outlined" onClick={() => navigate('/rider-dashboard')}>
          ← Back to Dashboard
        </Button>
        {!editMode ? (
          <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        ) : (
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 4, color: 'white', textAlign: 'center' }}>
          <Box position="relative" display="inline-block">
            <Avatar
              src={getProfilePicture()}
              sx={{ width: 150, height: 150, margin: '0 auto', border: '5px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            >
              {!getProfilePicture() && <Person sx={{ fontSize: 80 }} />}
            </Avatar>
            {editMode && (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'white',
                  '&:hover': { background: '#f0f0f0' }
                }}
              >
                <Edit />
                <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
              </IconButton>
            )}
          </Box>
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            {riderData?.full_name || 'Rider Profile'}
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>ID: {riderData?.id}</Typography>
        </Box>

        <Box sx={{ padding: 4 }}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#1976d2' }}>
                <Person /> Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={handleInputChange('full_name')}
                disabled={!editMode}
                InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Father Name"
                value={formData.father_name}
                onChange={handleInputChange('father_name')}
                disabled={!editMode}
                InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={!editMode}
                InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CNIC"
                value={riderData?.cnic_number || 'N/A'}
                disabled
                InputProps={{ startAdornment: <CreditCard sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Phone"
                value={formData.mobile_primary}
                onChange={handleInputChange('mobile_primary')}
                disabled={!editMode}
                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alternate Phone"
                value={formData.mobile_alternate}
                onChange={handleInputChange('mobile_alternate')}
                disabled={!editMode}
                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2, color: '#ff9800' }}>
                <Home /> Address Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                disabled={!editMode}
                multiline
                rows={2}
                InputProps={{ startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleInputChange('state')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zipcode"
                value={formData.zipcode}
                onChange={handleInputChange('zipcode')}
                disabled={!editMode}
              />
            </Grid>

            {/* Vehicle Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2, color: '#4caf50' }}>
                <DirectionsCar /> Vehicle Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Type"
                value={formData.vehicle_type}
                onChange={handleInputChange('vehicle_type')}
                disabled={!editMode}
                InputProps={{ startAdornment: <DirectionsCar sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Brand"
                value={formData.vehicle_brand}
                onChange={handleInputChange('vehicle_brand')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Model"
                value={formData.vehicle_model}
                onChange={handleInputChange('vehicle_model')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Registration"
                value={formData.vehicle_registration}
                onChange={handleInputChange('vehicle_registration')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driving License Number"
                value={formData.driving_license_number}
                onChange={handleInputChange('driving_license_number')}
                disabled={!editMode}
                InputProps={{ startAdornment: <CreditCard sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2, color: '#9c27b0' }}>
                <AccountBalance /> Bank Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bank_name}
                onChange={handleInputChange('bank_name')}
                disabled={!editMode}
                InputProps={{ startAdornment: <AccountBalance sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.account_number}
                onChange={handleInputChange('account_number')}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Account Title"
                value={formData.account_title}
                onChange={handleInputChange('account_title')}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default RiderProfile
