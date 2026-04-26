import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip, Chip, Select, MenuItem, FormControl, InputLabel, Avatar, Typography, Grid, Card, CardContent, Divider, InputAdornment } from '@mui/material'
import { Edit, Delete, Visibility, VisibilityOff, Person, CloudUpload, DirectionsCar, Description, AccountBalance, LocationOn, Phone, Email, Home, CreditCard, Badge } from '@mui/icons-material'
import axios from 'axios'

const VEHICLE_TYPES = ['Bike', 'Car', 'Van']
const VEHICLE_BRANDS = ['Honda', 'Suzuki', 'Toyota', 'Yamaha', 'KTM', 'United', 'Changan', 'Hyundai', 'Kia', 'Daihatsu']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']
const STATES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory']
const COUNTRIES = ['Pakistan', 'India', 'Bangladesh', 'Afghanistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE', 'Saudi Arabia']
const BANKS = ['HBL', 'UBL', 'MCB', 'Allied Bank', 'Bank Alfalah', 'Meezan Bank', 'Faysal Bank', 'Askari Bank', 'Standard Chartered', 'Bank Al Habib', 'Soneri Bank', 'Silk Bank', 'JS Bank', 'Dubai Islamic Bank', 'Samba Bank']

const Riders = memo(function Riders() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingRider, setEditingRider] = useState(null)
  const [viewingRider, setViewingRider] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({})
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
  
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    cnic_number: '',
    email: '',
    mobile_primary: '',
    mobile_alternate: '',
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_registration: '',
    driving_license_number: '',
    city: '',
    address: '',
    country: '',
    state: '',
    zipcode: '',
    bank_name: '',
    account_number: '',
    account_title: ''
  })

  const [editDocuments, setEditDocuments] = useState({
    profile_picture: null,
    cnic_front_image: null,
    cnic_back_image: null,
    driving_license_image: null,
    vehicle_registration_book: null,
    vehicle_image: null
  })
  const [editUploadStatus, setEditUploadStatus] = useState({})

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/riders", {
          timeout: 10000
        })
        setRiders(response.data.data)
      } catch (error) {
        
      } finally {
        setLoading(false)
      }
    }
    
    fetchRiders()
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

    setFormData(prev => ({ ...prev, [field]: value }))
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

    // Validate CNIC format
    if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic_number)) {
      alert('CNIC must be in correct format: 12345-1234567-1')
      return
    }

    // Validate mobile numbers
    if (!/^03\d{9}$/.test(formData.mobile_primary)) {
      alert('Primary mobile must be 11 digits starting with 03')
      return
    }

    if (formData.mobile_alternate && !/^03\d{9}$/.test(formData.mobile_alternate)) {
      alert('Alternate mobile must be 11 digits starting with 03')
      return
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Validate password
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    // Validate names - only letters
    if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
      alert('⚠️ Full name should contain only alphabets and spaces')
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.father_name)) {
      alert('⚠️ Father/Guardian name should contain only alphabets and spaces')
      return
    }

    // Validate CNIC - exactly 13 digits
    const cnicDigits = formData.cnic_number.replace(/\D/g, '')
    if (cnicDigits.length !== 13) {
      alert('⚠️ CNIC must be exactly 13 digits (e.g., 12345-1234567-1)')
      return
    }

    // Validate account title if provided
    if (formData.account_title && !/^[a-zA-Z\s]+$/.test(formData.account_title)) {
      alert('⚠️ Account title should contain only alphabets and spaces')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
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
      formDataToSend.append('country', formData.country || '')
      formDataToSend.append('zipcode', formData.zipcode || '')
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
      
      await axios.post('http://127.0.0.1:8000/api/rider-registrations', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      setOpen(false)
      setFormData({
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
      setUploadStatus({})
      const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
      setRiders(response.data.data)
      alert('Rider registration submitted successfully!')
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
    }
  }

  const handleEditFieldChange = (field) => (e) => {
    setEditFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleEdit = useCallback(async (rider) => {
    try {
      // Fetch fresh data from API
      const response = await axios.get(`http://127.0.0.1:8000/api/riders/${rider.id}`, { timeout: 10000 })
      const freshRider = response.data.data || response.data
      console.log('Fresh rider data for edit:', freshRider)
      
      setEditingRider(freshRider)
      setEditFormData({
        first_name: freshRider.first_name || '',
        last_name: freshRider.last_name || '',
        father_name: freshRider.father_name || '',
        cnic_number: freshRider.cnic_number || '',
        email: freshRider.email || '',
        mobile_primary: freshRider.mobile_primary || '',
        mobile_alternate: freshRider.mobile_alternate || '',
        vehicle_type: freshRider.vehicle_type || '',
        vehicle_brand: freshRider.vehicle_brand || '',
        vehicle_model: freshRider.vehicle_model || '',
        vehicle_registration: freshRider.vehicle_registration || '',
        driving_license_number: freshRider.driving_license_number || '',
        city: freshRider.address?.city || '',
        address: freshRider.address?.address || '',
        country: freshRider.address?.country || '',
        state: freshRider.address?.state || '',
        zipcode: freshRider.address?.zipcode || '',
        bank_name: freshRider.bank?.bank_name || freshRider.bank_name || '',
        account_number: freshRider.bank?.account_number || freshRider.account_number || '',
        account_title: freshRider.bank?.account_title || freshRider.account_title || ''
      })
      setEditDocuments({
        profile_picture: null,
        cnic_front_image: null,
        cnic_back_image: null,
        driving_license_image: null,
        vehicle_registration_book: null,
        vehicle_image: null
      })
      setEditUploadStatus({})
      setEditOpen(true)
    } catch (error) {
      console.error('Error fetching rider for edit:', error)
      // Fallback to table data
      setEditingRider(rider)
      setEditFormData({
        first_name: rider.first_name || '',
        last_name: rider.last_name || '',
        father_name: rider.father_name || '',
        cnic_number: rider.cnic_number || '',
        email: rider.email || '',
        mobile_primary: rider.mobile_primary || '',
        mobile_alternate: rider.mobile_alternate || '',
        vehicle_type: rider.vehicle_type || '',
        vehicle_brand: rider.vehicle_brand || '',
        vehicle_model: rider.vehicle_model || '',
        vehicle_registration: rider.vehicle_registration || '',
        driving_license_number: rider.driving_license_number || '',
        city: rider.address?.city || '',
        address: rider.address?.address || '',
        country: rider.address?.country || '',
        state: rider.address?.state || '',
        zipcode: rider.address?.zipcode || '',
        bank_name: rider.bank?.bank_name || rider.bank_name || '',
        account_number: rider.bank?.account_number || rider.account_number || '',
        account_title: rider.bank?.account_title || rider.account_title || ''
      })
      setEditDocuments({
        profile_picture: null,
        cnic_front_image: null,
        cnic_back_image: null,
        driving_license_image: null,
        vehicle_registration_book: null,
        vehicle_image: null
      })
      setEditUploadStatus({})
      setEditOpen(true)
    }
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this rider?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/riders/${id}`, { timeout: 10000 })
        const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
        setRiders(response.data.data)
        alert('Rider deleted successfully!')
      } catch (error) {
        
        const errorMessage = error.response?.status === 500 
          ? 'Server error: Cannot delete rider. It may be associated with other records.'
          : error.response?.data?.message || 'Error deleting rider'
        alert(errorMessage)
      }
    }
  }, [])

  const handleEditFileChange = (field) => (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditDocuments(prev => ({ ...prev, [field]: file }))
      setEditUploadStatus(prev => ({ ...prev, [field]: `✓ ${file.name}` }))
    }
  }

  const handleEditSubmit = async () => {
    try {
      const formDataToSend = new FormData()
      
      // Add all text fields
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) {
          formDataToSend.append(key, editFormData[key])
        }
      })
      
      // Add files if selected
      Object.keys(editDocuments).forEach(key => {
        if (editDocuments[key]) {
          formDataToSend.append(key, editDocuments[key])
        }
      })
      
      await axios.post(`http://127.0.0.1:8000/api/riders/${editingRider.id}?_method=PUT`, formDataToSend, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 
      })
      setEditOpen(false)
      setEditingRider(null)
      setEditFormData({
        first_name: '',
        last_name: '',
        father_name: '',
        cnic_number: '',
        email: '',
        mobile_primary: '',
        mobile_alternate: '',
        vehicle_type: '',
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_registration: '',
        driving_license_number: '',
        city: '',
        address: '',
        country: '',
        state: '',
        zipcode: '',
        bank_name: '',
        account_number: '',
        account_title: ''
      })
      setEditDocuments({
        profile_picture: null,
        cnic_front_image: null,
        cnic_back_image: null,
        driving_license_image: null,
        vehicle_registration_book: null,
        vehicle_image: null
      })
      setEditUploadStatus({})
      const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
      setRiders(response.data.data)
      alert('Rider updated successfully!')
    } catch (error) {
      
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : 'Please check console for details'
      alert(`Validation Error: ${errorMessages}`)
    }
  }

  const riderTable = useMemo(() => (
    <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <TableCell style={{color: 'white'}}>Rider ID</TableCell>
              <TableCell style={{color: 'white'}}>Name</TableCell>
              <TableCell style={{color: 'white'}}>Email</TableCell>
              <TableCell style={{color: 'white'}}>Phone</TableCell>
              <TableCell style={{color: 'white'}}>Vehicle</TableCell>
              <TableCell style={{color: 'white'}}>City</TableCell>
              <TableCell style={{color: 'white'}}>Address</TableCell>
              <TableCell style={{color: 'white'}}>Assigned To</TableCell>
              <TableCell style={{color: 'white'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riders.length > 0 ? riders.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell>{rider.id}</TableCell>
                <TableCell>{rider.first_name} {rider.last_name}</TableCell>
                <TableCell>{rider.email}</TableCell>
                <TableCell>{rider.mobile_primary}</TableCell>
                <TableCell>{rider.vehicle_type} - {rider.vehicle_brand}</TableCell>
                <TableCell>{rider.address?.city || 'N/A'}</TableCell>
                <TableCell>{rider.address?.address || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={rider.assigned_parcels_count || 0} 
                    color={rider.assigned_parcels_count > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={async () => {
                          try {
                            const response = await axios.get(`http://127.0.0.1:8000/api/riders/${rider.id}`, { timeout: 10000 })
                            console.log('Full API Response:', response.data)
                            const riderData = response.data.data || response.data
                            console.log('Rider Data:', riderData)
                            console.log('Profile image:', riderData.profile_image)
                            setViewingRider(riderData)
                            setViewOpen(true)
                          } catch (error) {
                            console.error('Error fetching rider:', error)
                            setViewingRider(rider)
                            setViewOpen(true)
                          }
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Rider">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEdit(rider)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Rider">
                      <IconButton size="small" color="error" onClick={() => handleDelete(rider.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} style={{textAlign: 'center'}}>
                  No riders available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  ), [riders])

  if (loading) {
    return <div style={{textAlign: 'center', padding: '20px', fontSize: '18px'}}>Loading...</div>
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <p>Total Riders: {riders.length}</p>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Rider
        </Button>
      </Box>
      {riderTable}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth disablePortal key={open ? 'open' : 'closed'}>
        <DialogTitle>Add New Rider</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Full Name *"
              value={formData.full_name}
              onChange={handleFieldChange('full_name')}
              fullWidth
              helperText="Only alphabets and spaces allowed"
            />
            <TextField
              label="Father / Guardian Name *"
              value={formData.father_name}
              onChange={handleFieldChange('father_name')}
              fullWidth
              helperText="Only alphabets and spaces allowed"
            />
            <TextField
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              fullWidth
            />
            <TextField
              label="Phone Number *"
              placeholder="03001234567"
              value={formData.mobile_primary}
              onChange={handleFieldChange('mobile_primary')}
              fullWidth
              helperText="11 digits starting with 03"
            />
            <TextField
              label="Alternate Phone Number"
              placeholder="03001234567"
              value={formData.mobile_alternate}
              onChange={handleFieldChange('mobile_alternate')}
              fullWidth
              helperText="11 digits starting with 03"
            />
            <TextField
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleFieldChange('password')}
              fullWidth
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
            <TextField
              label="Address *"
              value={formData.address}
              onChange={handleFieldChange('address')}
              fullWidth
              multiline
              rows={3}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>City *</InputLabel>
                <Select 
                  value={formData.city}
                  onChange={handleFieldChange('city')} 
                  label="City *"
                >
                  {CITIES.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                </Select>
              </FormControl>
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
            </Box>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select 
                  value={formData.country}
                  onChange={handleFieldChange('country')} 
                  label="Country"
                >
                  {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Zipcode"
                value={formData.zipcode}
                onChange={handleFieldChange('zipcode')}
                placeholder="54000"
                fullWidth
              />
            </Box>
            <TextField
              label="CNIC Number *"
              placeholder="12345-1234567-1"
              value={formData.cnic_number}
              onChange={handleFieldChange('cnic_number')}
              fullWidth
              helperText="Exactly 13 digits required"
            />
            <TextField
              label="Driving License Number *"
              value={formData.driving_license_number}
              onChange={handleFieldChange('driving_license_number')}
              fullWidth
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type *</InputLabel>
                <Select 
                  value={formData.vehicle_type}
                  onChange={handleFieldChange('vehicle_type')} 
                  label="Vehicle Type *"
                >
                  {VEHICLE_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Vehicle Brand *</InputLabel>
                <Select 
                  value={formData.vehicle_brand}
                  onChange={handleFieldChange('vehicle_brand')} 
                  label="Vehicle Brand *"
                >
                  {VEHICLE_BRANDS.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Vehicle Model *"
              placeholder="CD 70, Civic, etc."
              value={formData.vehicle_model}
              onChange={handleFieldChange('vehicle_model')}
              fullWidth
            />
            <TextField
              label="Vehicle Registration Number *"
              placeholder="ABC-123"
              value={formData.vehicle_registration}
              onChange={handleFieldChange('vehicle_registration')}
              fullWidth
            />
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
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ 
                height: '56px',
                borderStyle: 'dashed',
                borderWidth: 2,
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
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ 
                height: '56px',
                borderStyle: 'dashed',
                borderWidth: 2,
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
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ 
                height: '56px',
                borderStyle: 'dashed',
                borderWidth: 2,
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Rider</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={
              viewingRider?.profile_image ? `http://127.0.0.1:8000/storage/${viewingRider.profile_image}` :
              viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture')?.document_path ? 
                `http://127.0.0.1:8000/storage/${viewingRider.documents.find(doc => doc.document_type === 'profile_picture').document_path}` :
              undefined
            }
            sx={{ 
              width: 80, 
              height: 80, 
              border: '4px solid white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: (viewingRider?.profile_image || viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture')) ? 'pointer' : 'default',
              transition: 'transform 0.3s ease',
              '&:hover': (viewingRider?.profile_image || viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture')) ? {
                transform: 'scale(1.1)'
              } : {}
            }}
            onClick={() => {
              const profileDoc = viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture')
              const imgSrc = viewingRider?.profile_image || profileDoc?.document_path
              if (imgSrc) {
                console.log('Opening image:', imgSrc)
                window.open(`http://127.0.0.1:8000/storage/${imgSrc}`, '_blank')
              }
            }}
          >
            {!viewingRider?.profile_image && !viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture') && <Person sx={{ fontSize: 40 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {viewingRider?.full_name || `${viewingRider?.first_name} ${viewingRider?.last_name}` || 'Rider Details'}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>ID: {viewingRider?.id}</Typography>
            {(viewingRider?.profile_image || viewingRider?.documents?.find(doc => doc.document_type === 'profile_picture')) && (
              <Typography sx={{ opacity: 0.8, fontSize: '0.85rem', mt: 0.5 }}>Click photo to view full size</Typography>
            )}
          </Box>
        </Box>
        <DialogContent sx={{ padding: '24px', background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
          {viewingRider && (
            <div>
              {/* Personal Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', color: '#1976d2' }}>
                  <Person /> Personal Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Badge fontSize="small" /> Full Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.full_name || `${viewingRider.first_name} ${viewingRider.last_name}` || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Person fontSize="small" /> Father Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.rider_details?.father_name || viewingRider.father_name || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> CNIC:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.rider_details?.cnic_number || viewingRider.cnic_number || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Email fontSize="small" /> Email:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.email || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Phone fontSize="small" /> Primary Phone:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.rider_details?.mobile_primary || viewingRider.mobile_primary || viewingRider.phone || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Phone fontSize="small" /> Alternate Phone:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.rider_details?.mobile_alternate || viewingRider.mobile_alternate || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Home fontSize="small" /> Address:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.address?.address || viewingRider.address || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Location */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #ff9800', fontWeight: 600, fontSize: '1.1rem', color: '#ff9800' }}>
                  <LocationOn /> Location
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> City:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.address?.city || viewingRider.city || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> State:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.address?.state || viewingRider.state || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Vehicle Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #4caf50', fontWeight: 600, fontSize: '1.1rem', color: '#4caf50' }}>
                  <DirectionsCar /> Vehicle Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Type:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.vehicle?.vehicle_type || viewingRider.vehicle_type || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Brand:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.vehicle?.vehicle_brand || viewingRider.vehicle_brand || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Model:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.vehicle?.vehicle_model || viewingRider.vehicle_model || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Description fontSize="small" /> Registration:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.vehicle?.vehicle_registration || viewingRider.vehicle_registration || 'Not Provided'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> License Number:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.rider_details?.driving_license_number || viewingRider.driving_license_number || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Bank Details */}
              {(viewingRider.bank?.bank_name || viewingRider.bank_name || viewingRider.bank?.account_number || viewingRider.account_number) && (
                <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #9c27b0', fontWeight: 600, fontSize: '1.1rem', color: '#9c27b0' }}>
                    <AccountBalance /> Bank Details
                  </Typography>
                  <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><AccountBalance fontSize="small" /> Bank:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.bank?.bank_name || viewingRider.bank_name || 'N/A'}</Box>
                  </Box>
                  <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> Account Number:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.bank?.account_number || viewingRider.account_number || 'Not Provided'}</Box>
                  </Box>
                  <Box sx={{ display: 'flex', padding: '10px 0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Person fontSize="small" /> Account Title:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewingRider.bank?.account_title || viewingRider.account_title || 'N/A'}</Box>
                  </Box>
                </Box>
              )}
              
              {/* Documents */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #f44336', fontWeight: 600, fontSize: '1.1rem', color: '#f44336' }}>
                  <Description /> Documents
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5, marginTop: 1.5 }}>
                  {viewingRider.documents?.length > 0 ? (
                    viewingRider.documents.map((doc, idx) => (
                      <Button 
                        key={idx}
                        variant="contained"
                        size="small" 
                        onClick={() => window.open(`http://127.0.0.1:8000/storage/${doc.document_path}`, '_blank')}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          textTransform: 'capitalize',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                      >
                        {doc.document_type?.replace('_', ' ').toUpperCase()}
                      </Button>
                    ))
                  ) : (
                    <Typography color="text.secondary">No documents uploaded</Typography>
                  )}
                </Box>
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', background: '#f8f9fa' }}>
          <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ borderRadius: '12px', textTransform: 'none', px: 4 }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        maxWidth="md" 
        fullWidth 
        disablePortal 
        key={editOpen ? 'edit-open' : 'edit-closed'}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={
                editDocuments.profile_picture ? URL.createObjectURL(editDocuments.profile_picture) : 
                editingRider?.profile_image ? `http://127.0.0.1:8000/storage/${editingRider.profile_image}` :
                editingRider?.documents?.find(doc => doc.document_type === 'profile_picture')?.document_path ?
                  `http://127.0.0.1:8000/storage/${editingRider.documents.find(doc => doc.document_type === 'profile_picture').document_path}` :
                undefined
              }
              sx={{ width: 80, height: 80, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              {!editDocuments.profile_picture && !editingRider?.profile_image && !editingRider?.documents?.find(doc => doc.document_type === 'profile_picture') && <Person sx={{ fontSize: 40 }} />}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                backgroundColor: 'white',
                width: 35,
                height: 35,
                '&:hover': { backgroundColor: '#f0f0f0' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#667eea' }} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleEditFileChange('profile_picture')}
              />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Edit Rider Details
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>{editingRider?.first_name} {editingRider?.last_name}</Typography>
          </Box>
        </Box>
        <DialogContent sx={{ padding: '24px', background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Personal Information Section */}
            <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', color: '#1976d2' }}>
                <Person /> Personal Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <TextField
                    label="First Name"
                    value={editFormData.first_name}
                    onChange={handleEditFieldChange('first_name')}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={editFormData.last_name}
                    onChange={handleEditFieldChange('last_name')}
                    fullWidth
                  />
                </Box>
                <TextField
                  label="Father Name"
                  value={editFormData.father_name}
                  onChange={handleEditFieldChange('father_name')}
                  fullWidth
                />
                <TextField
                  label="CNIC"
                  value={editFormData.cnic_number}
                  onChange={handleEditFieldChange('cnic_number')}
                  placeholder="00000-0000000-0"
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFieldChange('email')}
                  fullWidth
                />
                <Box display="flex" gap={2}>
                  <TextField
                    label="Primary Phone"
                    value={editFormData.mobile_primary}
                    onChange={handleEditFieldChange('mobile_primary')}
                    placeholder="03000000000"
                    fullWidth
                  />
                  <TextField
                    label="Alternate Phone"
                    value={editFormData.mobile_alternate}
                    onChange={handleEditFieldChange('mobile_alternate')}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>

            {/* Location Section */}
            <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #ff9800', fontWeight: 600, fontSize: '1.1rem', color: '#ff9800' }}>
                <LocationOn /> Location
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Address"
                  value={editFormData.address}
                  onChange={handleEditFieldChange('address')}
                  fullWidth
                  multiline
                  rows={2}
                />
                <Box display="flex" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <Select value={editFormData.city} onChange={handleEditFieldChange('city')} label="City">
                      {CITIES.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select value={editFormData.state} onChange={handleEditFieldChange('state')} label="State">
                      {STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box display="flex" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select value={editFormData.country} onChange={handleEditFieldChange('country')} label="Country">
                      {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Zipcode"
                    value={editFormData.zipcode}
                    onChange={handleEditFieldChange('zipcode')}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>

            {/* Vehicle Information Section */}
            <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #4caf50', fontWeight: 600, fontSize: '1.1rem', color: '#4caf50' }}>
                <DirectionsCar /> Vehicle Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select value={editFormData.vehicle_type} onChange={handleEditFieldChange('vehicle_type')} label="Vehicle Type">
                      <MenuItem value="Bike">Bike</MenuItem>
                      <MenuItem value="Car">Car</MenuItem>
                      <MenuItem value="Van">Van</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Vehicle Brand"
                    value={editFormData.vehicle_brand}
                    onChange={handleEditFieldChange('vehicle_brand')}
                    fullWidth
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Vehicle Model"
                    value={editFormData.vehicle_model}
                    onChange={handleEditFieldChange('vehicle_model')}
                    fullWidth
                  />
                  <TextField
                    label="Vehicle Registration"
                    value={editFormData.vehicle_registration}
                    onChange={handleEditFieldChange('vehicle_registration')}
                    fullWidth
                  />
                </Box>
                <TextField
                  label="Driving License Number"
                  value={editFormData.driving_license_number}
                  onChange={handleEditFieldChange('driving_license_number')}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Bank Details Section */}
            <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #9c27b0', fontWeight: 600, fontSize: '1.1rem', color: '#9c27b0' }}>
                <AccountBalance /> Bank Details
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Bank Name</InputLabel>
                  <Select value={editFormData.bank_name} onChange={handleEditFieldChange('bank_name')} label="Bank Name">
                    {BANKS.map(bank => <MenuItem key={bank} value={bank}>{bank}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="Account Number"
                  value={editFormData.account_number}
                  onChange={handleEditFieldChange('account_number')}
                  fullWidth
                />
                <TextField
                  label="Account Title"
                  value={editFormData.account_title}
                  onChange={handleEditFieldChange('account_title')}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Documents Section */}
            <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #f44336', fontWeight: 600, fontSize: '1.1rem', color: '#f44336' }}>
                <Description /> Upload Documents
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ 
                      height: '56px',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      color: editUploadStatus.cnic_front_image ? 'green' : 'inherit',
                      borderColor: editUploadStatus.cnic_front_image ? 'green' : 'inherit'
                    }}
                  >
                    {editUploadStatus.cnic_front_image || 'CNIC Front'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleEditFileChange('cnic_front_image')}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ 
                      height: '56px',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      color: editUploadStatus.cnic_back_image ? 'green' : 'inherit',
                      borderColor: editUploadStatus.cnic_back_image ? 'green' : 'inherit'
                    }}
                  >
                    {editUploadStatus.cnic_back_image || 'CNIC Back'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleEditFileChange('cnic_back_image')}
                    />
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ 
                    height: '56px',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    color: editUploadStatus.driving_license_image ? 'green' : 'inherit',
                    borderColor: editUploadStatus.driving_license_image ? 'green' : 'inherit'
                  }}
                >
                  {editUploadStatus.driving_license_image || 'Driving License'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleEditFileChange('driving_license_image')}
                  />
                </Button>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ 
                      height: '56px',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      color: editUploadStatus.vehicle_registration_book ? 'green' : 'inherit',
                      borderColor: editUploadStatus.vehicle_registration_book ? 'green' : 'inherit'
                    }}
                  >
                    {editUploadStatus.vehicle_registration_book || 'Vehicle Registration Book'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleEditFileChange('vehicle_registration_book')}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ 
                      height: '56px',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      color: editUploadStatus.vehicle_image ? 'green' : 'inherit',
                      borderColor: editUploadStatus.vehicle_image ? 'green' : 'inherit'
                    }}
                  >
                    {editUploadStatus.vehicle_image || 'Vehicle Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleEditFileChange('vehicle_image')}
                    />
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', background: '#f8f9fa', gap: 1 }}>
          <Button 
            onClick={() => setEditOpen(false)} 
            variant="outlined" 
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
              }
            }}
          >
            Update Rider
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
})

export default Riders
