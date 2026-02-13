import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import axios from 'axios'

const Merchants = memo(function Merchants() {
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState(null)
  const formDataRef = useRef({
    first_name: '',
    last_name: '',
    email: '',
    per_parcel_payout: '',
    company_name: '',
    per_parcel_rate: '',
    city: '',
    address: '',
    country: '',
    state: '',
    zipcode: ''
  })

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/merchants", {
          timeout: 5000
        })
        setMerchants(response.data.data)
      } catch (error) {
        console.error('API Error:', error)
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          alert('Backend server is not running. Please start your Laravel server.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchMerchants()
  }, [])

  const handleFieldChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    formDataRef.current[field] = value
  }

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = {
      first_name: 'First Name',
      last_name: 'Last Name', 
      email: 'Email',
      company_name: 'Company Name',
      per_parcel_rate: 'Per Parcel Rate',
      city: 'City',
      address: 'Address',
      country: 'Country',
      state: 'State',
      zipcode: 'Zipcode'
    }
    
    const missingFields = []
    Object.keys(requiredFields).forEach(field => {
      if (!formDataRef.current[field] || formDataRef.current[field].toString().trim() === '') {
        missingFields.push(requiredFields[field])
      }
    })
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }
    
    try {
      console.log('Sending merchant data:', formDataRef.current)
      
      const response = await axios.post('http://127.0.0.1:8000/api/merchants', formDataRef.current)
      console.log('Success response:', response.data)
      
      setOpen(false)
      formDataRef.current = {
        first_name: '',
        last_name: '',
        email: '',
        per_parcel_payout: '',
        company_name: '',
        per_parcel_rate: '',
        city: '',
        address: '',
        country: '',
        state: '',
        zipcode: ''
      }
      const refreshResponse = await axios.get("http://127.0.0.1:8000/api/merchants")
      setMerchants(refreshResponse.data.data)
      alert('Merchant added successfully!')
    } catch (error) {
      console.error('Error adding merchant:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.status === 500) {
        alert('Server Error: Please check if the backend server is running and database is connected.')
      } else {
        const errorMessages = error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.response?.data?.message || 'Please check console for details'
        
        alert(`Error: ${errorMessages}`)
      }
    }
  }

  const handleEdit = useCallback((merchant) => {
    setEditingMerchant(merchant)
    formDataRef.current = {
      first_name: merchant.first_name || '',
      last_name: merchant.last_name || '',
      email: merchant.email || '',
      per_parcel_payout: merchant.per_parcel_payout || '',
      company_name: merchant.company_name || merchant.company?.company_name || '',
      per_parcel_rate: merchant.per_parcel_rate || merchant.company?.per_parcel_rate || '',
      city: merchant.address?.city || '',
      address: merchant.address?.address || '',
      country: merchant.address?.country || '',
      state: merchant.address?.state || '',
      zipcode: merchant.address?.zipcode || ''
    }
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this merchant?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/merchants/${id}`)
        const response = await axios.get("http://127.0.0.1:8000/api/merchants")
        setMerchants(response.data.data)
        alert('Merchant deleted successfully!')
      } catch (error) {
        console.error('Error deleting merchant:', error)
        const errorMessage = error.response?.status === 500 
          ? 'Server error: Cannot delete merchant. It may be associated with other records.'
          : error.response?.data?.message || 'Error deleting merchant'
        alert(errorMessage)
      }
    }
  }, [])

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/merchants/${editingMerchant.id}`, formDataRef.current)
      setEditOpen(false)
      setEditingMerchant(null)
      formDataRef.current = {
        first_name: '',
        last_name: '',
        email: '',
        per_parcel_payout: '',
        company_name: '',
        per_parcel_rate: '',
        city: '',
        address: '',
        country: '',
        state: '',
        zipcode: ''
      }
      const response = await axios.get("http://127.0.0.1:8000/api/merchants")
      setMerchants(response.data.data)
      alert('Merchant updated successfully!')
    } catch (error) {
      console.error('Error updating merchant:', error)
      
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : 'Please check console for details'
      
      alert(`Validation Error: ${errorMessages}`)
    }
  }

  const merchantTable = useMemo(() => (
    <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <TableCell style={{color: 'white'}}>ID</TableCell>
              <TableCell style={{color: 'white'}}>First Name</TableCell>
              <TableCell style={{color: 'white'}}>Last Name</TableCell>
              <TableCell style={{color: 'white'}}>Email</TableCell>
              <TableCell style={{color: 'white'}}>Company Name</TableCell>
              <TableCell style={{color: 'white'}}>Per Parcel Payout</TableCell>
              <TableCell style={{color: 'white'}}>Per Parcel Rate</TableCell>
              <TableCell style={{color: 'white'}}>City</TableCell>
              <TableCell style={{color: 'white'}}>Address</TableCell>
              <TableCell style={{color: 'white'}}>State</TableCell>
              <TableCell style={{color: 'white'}}>Country</TableCell>
              <TableCell style={{color: 'white'}}>Zipcode</TableCell>
              <TableCell style={{color: 'white'}}>Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchants.length > 0 ? merchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>{merchant.id}</TableCell>
                <TableCell>{merchant.first_name}</TableCell>
                <TableCell>{merchant.last_name}</TableCell>
                <TableCell>{merchant.email}</TableCell>
                <TableCell>{merchant.company_name || merchant.company?.company_name || 'N/A'}</TableCell>
                <TableCell>Rs. {merchant.per_parcel_payout}</TableCell>
                <TableCell>Rs. {merchant.per_parcel_rate || merchant.company?.per_parcel_rate || '0.00'}</TableCell>
                <TableCell>{merchant.address?.city || 'N/A'}</TableCell>
                <TableCell>{merchant.address?.address || 'N/A'}</TableCell>
                <TableCell>{merchant.address?.state || 'N/A'}</TableCell>
                <TableCell>{merchant.address?.country || 'N/A'}</TableCell>
                <TableCell>{merchant.address?.zipcode || 'N/A'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit Merchant">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(merchant)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Merchant">
                      <IconButton size="small" color="error" onClick={() => handleDelete(merchant.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={13} style={{textAlign: 'center'}}>
                  No merchants available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  ), [merchants])

  if (loading) {
    return <div style={{textAlign: 'center', padding: '20px', fontSize: '18px'}}>Loading...</div>
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <p>Total Merchants: {merchants.length}</p>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Merchant
        </Button>
      </Box>
      {merchantTable}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth disablePortal key={open ? 'open' : 'closed'}>
        <DialogTitle>Add New Merchant</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" gap={2}>
              <TextField
                label="First Name"
                defaultValue={formDataRef.current.first_name}
                onChange={handleFieldChange('first_name')}
                fullWidth
              />
              <TextField
                label="Last Name"
                defaultValue={formDataRef.current.last_name}
                onChange={handleFieldChange('last_name')}
                fullWidth
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              defaultValue={formDataRef.current.email}
              onChange={handleFieldChange('email')}
              fullWidth
            />
            <TextField
              label="Per Parcel Payout"
              type="number"
              defaultValue={formDataRef.current.per_parcel_payout}
              onChange={handleFieldChange('per_parcel_payout')}
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Company Name"
                defaultValue={formDataRef.current.company_name}
                onChange={handleFieldChange('company_name')}
                fullWidth
              />
              <TextField
                label="Per Parcel Rate"
                type="number"
                defaultValue={formDataRef.current.per_parcel_rate}
                onChange={handleFieldChange('per_parcel_rate')}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="City"
                defaultValue={formDataRef.current.city}
                onChange={handleFieldChange('city')}
                fullWidth
              />
              <TextField
                label="State"
                defaultValue={formDataRef.current.state}
                onChange={handleFieldChange('state')}
                fullWidth
              />
            </Box>
            <TextField
              label="Address"
              defaultValue={formDataRef.current.address}
              onChange={handleFieldChange('address')}
              fullWidth
              multiline
              rows={2}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Country"
                defaultValue={formDataRef.current.country}
                onChange={handleFieldChange('country')}
                fullWidth
              />
              <TextField
                label="Zipcode"
                defaultValue={formDataRef.current.zipcode}
                onChange={handleFieldChange('zipcode')}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Merchant</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth disablePortal key={editOpen ? 'edit-open' : 'edit-closed'}>
        <DialogTitle>Edit Merchant</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" gap={2}>
              <TextField
                label="First Name"
                defaultValue={formDataRef.current.first_name}
                onChange={handleFieldChange('first_name')}
                fullWidth
              />
              <TextField
                label="Last Name"
                defaultValue={formDataRef.current.last_name}
                onChange={handleFieldChange('last_name')}
                fullWidth
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              defaultValue={formDataRef.current.email}
              onChange={handleFieldChange('email')}
              fullWidth
            />
            <TextField
              label="Per Parcel Payout"
              type="number"
              defaultValue={formDataRef.current.per_parcel_payout}
              onChange={handleFieldChange('per_parcel_payout')}
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Company Name"
                defaultValue={formDataRef.current.company_name}
                onChange={handleFieldChange('company_name')}
                fullWidth
              />
              <TextField
                label="Per Parcel Rate"
                type="number"
                defaultValue={formDataRef.current.per_parcel_rate}
                onChange={handleFieldChange('per_parcel_rate')}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="City"
                defaultValue={formDataRef.current.city}
                onChange={handleFieldChange('city')}
                fullWidth
              />
              <TextField
                label="State"
                defaultValue={formDataRef.current.state}
                onChange={handleFieldChange('state')}
                fullWidth
              />
            </Box>
            <TextField
              label="Address"
              defaultValue={formDataRef.current.address}
              onChange={handleFieldChange('address')}
              fullWidth
              multiline
              rows={2}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Country"
                defaultValue={formDataRef.current.country}
                onChange={handleFieldChange('country')}
                fullWidth
              />
              <TextField
                label="Zipcode"
                defaultValue={formDataRef.current.zipcode}
                onChange={handleFieldChange('zipcode')}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update Merchant</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
})

export default Merchants