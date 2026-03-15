import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility, CheckCircle, Cancel } from '@mui/icons-material'
import axios from 'axios'

const Merchants = memo(function Merchants() {
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
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
        console.log('Merchants data:', response.data.data)
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

  const handleView = useCallback((merchant) => {
    setSelectedMerchant(merchant)
    setViewOpen(true)
  }, [])

  const handleApprove = useCallback(async (id) => {
    if (confirm('Are you sure you want to approve this merchant?')) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/merchants/${id}/approve`)
        const response = await axios.get("http://127.0.0.1:8000/api/merchants")
        setMerchants(response.data.data)
        alert('Merchant approved successfully!')
      } catch (error) {
        console.error('Error approving merchant:', error)
        alert('Error approving merchant')
      }
    }
  }, [])

  const handleReject = useCallback(async (id) => {
    if (confirm('Are you sure you want to reject this merchant?')) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/merchants/${id}/reject`)
        const response = await axios.get("http://127.0.0.1:8000/api/merchants")
        setMerchants(response.data.data)
        alert('Merchant rejected successfully!')
      } catch (error) {
        console.error('Error rejecting merchant:', error)
        alert('Error rejecting merchant')
      }
    }
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
              <TableCell style={{color: 'white'}}>Business Name</TableCell>
              <TableCell style={{color: 'white'}}>Owner Name</TableCell>
              <TableCell style={{color: 'white'}}>Email</TableCell>
              <TableCell style={{color: 'white'}}>Phone</TableCell>
              <TableCell style={{color: 'white'}}>City</TableCell>
              <TableCell style={{color: 'white'}}>Product Type</TableCell>
              <TableCell style={{color: 'white'}}>Status</TableCell>
              <TableCell style={{color: 'white'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchants.length > 0 ? merchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>{merchant.id}</TableCell>
                <TableCell>{merchant.company?.company_name || 'N/A'}</TableCell>
                <TableCell>{merchant.first_name} {merchant.last_name}</TableCell>
                <TableCell>{merchant.email || 'N/A'}</TableCell>
                <TableCell>{merchant.phone || 'N/A'}</TableCell>
                <TableCell>{merchant.address?.city || 'N/A'}</TableCell>
                <TableCell>{merchant.company?.product_type || 'N/A'}</TableCell>
                <TableCell>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: merchant.approval_status === 'approved' ? '#4caf50' : merchant.approval_status === 'rejected' ? '#f44336' : '#ff9800',
                    color: 'white'
                  }}>
                    {merchant.approval_status || 'pending'}
                  </span>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} sx={{ minWidth: '180px' }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info" onClick={() => handleView(merchant)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {merchant.approval_status === 'pending' ? (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" style={{color: '#4caf50'}} onClick={() => handleApprove(merchant.id)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => handleReject(merchant.id)}>
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Box sx={{ width: '80px' }} />
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(merchant.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} style={{textAlign: 'center'}}>
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

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Merchant Details</DialogTitle>
        <DialogContent>
          {selectedMerchant && (
            <Box sx={{ mt: 2, p: 2 }}>
              <p><strong>Business Name:</strong> {selectedMerchant.company?.company_name || 'N/A'}</p>
              <p><strong>Owner Name:</strong> {selectedMerchant.first_name} {selectedMerchant.last_name}</p>
              <p><strong>Email:</strong> {selectedMerchant.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedMerchant.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedMerchant.company?.address || 'N/A'}</p>
              <p><strong>City:</strong> {selectedMerchant.address?.city || 'N/A'}</p>
              <p><strong>Product Type:</strong> {selectedMerchant.company?.product_type || 'N/A'}</p>
              <p><strong>Avg Parcels/Day:</strong> {selectedMerchant.company?.avg_parcels_per_day || 'N/A'}</p>
              <p><strong>Per Parcel Rate:</strong> {selectedMerchant.company?.per_parcel_rate || 'N/A'}</p>
              <p><strong>Bank Name:</strong> {selectedMerchant.company?.bank_name || 'N/A'}</p>
              <p><strong>Account Number:</strong> {selectedMerchant.company?.account_number || 'N/A'}</p>
              {selectedMerchant.company?.business_document && (
                <p><strong>Business Document:</strong> <a href={`http://127.0.0.1:8000/storage/${selectedMerchant.company.business_document}`} target="_blank" rel="noopener noreferrer">View Document</a></p>
              )}
              <p><strong>Status:</strong> {selectedMerchant.approval_status || 'pending'}</p>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
})

export default Merchants