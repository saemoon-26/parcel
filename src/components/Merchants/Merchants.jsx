import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip, Avatar, Typography } from '@mui/material'
import { Edit, Delete, Visibility, CheckCircle, Cancel, Person, Phone, Email, Home, Business, LocationOn, Description, Badge } from '@mui/icons-material'
import axios from 'axios'

const Merchants = memo(function Merchants() {
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [editingMerchant, setEditingMerchant] = useState(null)
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
  const [documentFile, setDocumentFile] = useState(null)

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/merchants", {
          timeout: 5000
        })
        setMerchants(response.data.data)
      } catch (error) {
        
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
    if (field === 'business_document') {
      const file = e.target.files[0]
      setDocumentFile(file)
      setFormData(prev => ({ ...prev, [field]: file }))
    } else {
      const value = e.target.value
      setFormData(prev => ({ ...prev, [field]: value }))
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
      postal_code: 'Postal Code'
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
    
    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'business_document' && documentFile) {
          submitData.append(key, documentFile)
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })
      
      const response = await axios.post('http://127.0.0.1:8000/api/merchants', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setOpen(false)
      setFormData({
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
      setDocumentFile(null)
      const refreshResponse = await axios.get("http://127.0.0.1:8000/api/merchants")
      setMerchants(refreshResponse.data.data)
      alert('Merchant added successfully!')
    } catch (error) {
      
      
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
    setFormData({
      business_name: merchant.company?.company_name || '',
      owner_name: merchant.first_name || '',
      email: merchant.email || '',
      phone_number: merchant.phone || '',
      full_address: merchant.company?.address || '',
      city: merchant.address?.city || '',
      state: merchant.address?.state || '',
      country: merchant.address?.country || '',
      postal_code: merchant.address?.zipcode || '',
      product_type: merchant.company?.product_type || '',
      business_document: null
    })
    setDocumentFile(null)
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
        
        const errorMessage = error.response?.status === 500 
          ? 'Server error: Cannot delete merchant. It may be associated with other records.'
          : error.response?.data?.message || 'Error deleting merchant'
        alert(errorMessage)
      }
    }
  }, [])

  const handleEditSubmit = async () => {
    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'business_document' && documentFile) {
          submitData.append(key, documentFile)
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })
      
      await axios.post(`http://127.0.0.1:8000/api/merchants/${editingMerchant.id}?_method=PUT`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setEditOpen(false)
      setEditingMerchant(null)
      setFormData({
        business_name: '',
        owner_name: '',
        email: '',
        phone_number: '',
        full_address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        product_type: '',
        business_document: null
      })
      setDocumentFile(null)
      const response = await axios.get("http://127.0.0.1:8000/api/merchants")
      setMerchants(response.data.data)
      alert('Merchant updated successfully!')
    } catch (error) {
      
      
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Please check console for details'
      
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
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info" onClick={() => handleView(merchant)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(merchant)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(merchant.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    {merchant.approval_status === 'pending' && (
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
                    )}
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
            <TextField
              label="Business Name *"
              value={formData.business_name}
              onChange={handleFieldChange('business_name')}
              fullWidth
            />
            <TextField
              label="Owner Name *"
              value={formData.owner_name}
              onChange={handleFieldChange('owner_name')}
              fullWidth
            />
            <TextField
              label="Email *"
              type="email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              fullWidth
            />
            <TextField
              label="Phone Number *"
              value={formData.phone_number}
              onChange={handleFieldChange('phone_number')}
              fullWidth
            />
            <TextField
              label="Password *"
              type="password"
              value={formData.password}
              onChange={handleFieldChange('password')}
              fullWidth
            />
            <TextField
              label="Full Address *"
              value={formData.full_address}
              onChange={handleFieldChange('full_address')}
              fullWidth
              multiline
              rows={2}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="City *"
                value={formData.city}
                onChange={handleFieldChange('city')}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={handleFieldChange('state')}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={handleFieldChange('country')}
                fullWidth
              />
              <TextField
                label="Postal Code *"
                value={formData.postal_code}
                onChange={handleFieldChange('postal_code')}
                fullWidth
              />
            </Box>
            <TextField
              label="Product Type"
              value={formData.product_type}
              onChange={handleFieldChange('product_type')}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              {documentFile ? `✓ ${documentFile.name}` : 'Upload Business Document'}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                onChange={handleFieldChange('business_document')}
              />
            </Button>
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
            <TextField
              label="Business Name"
              value={formData.business_name}
              onChange={handleFieldChange('business_name')}
              fullWidth
            />
            <TextField
              label="Owner Name"
              value={formData.owner_name}
              onChange={handleFieldChange('owner_name')}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.phone_number}
              onChange={handleFieldChange('phone_number')}
              fullWidth
            />
            <TextField
              label="Full Address"
              value={formData.full_address}
              onChange={handleFieldChange('full_address')}
              fullWidth
              multiline
              rows={2}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="City"
                value={formData.city}
                onChange={handleFieldChange('city')}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={handleFieldChange('state')}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={handleFieldChange('country')}
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={formData.postal_code}
                onChange={handleFieldChange('postal_code')}
                fullWidth
              />
            </Box>
            <TextField
              label="Product Type"
              value={formData.product_type}
              onChange={handleFieldChange('product_type')}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              {documentFile ? `✓ ${documentFile.name}` : 'Upload New Business Document'}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                onChange={handleFieldChange('business_document')}
              />
            </Button>
            {editingMerchant?.company?.business_document && (
              <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <a href={`http://127.0.0.1:8000/storage/${editingMerchant.company.business_document}`} target="_blank" rel="noopener noreferrer">
                  View Current Document
                </a>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update Merchant</Button>
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
          <Avatar sx={{ width: 80, height: 80, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Business sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {selectedMerchant?.company?.company_name || 'Merchant Details'}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>ID: {selectedMerchant?.id}</Typography>
          </Box>
        </Box>
        <DialogContent sx={{ padding: '24px', background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
          {selectedMerchant && (
            <div>
              {/* Business Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', color: '#1976d2' }}>
                  <Business /> Business Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Business fontSize="small" /> Business Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.company?.company_name || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Person fontSize="small" /> Owner Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.first_name} {selectedMerchant.last_name}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Email fontSize="small" /> Email:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.email || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Phone fontSize="small" /> Phone:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.phone || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Description fontSize="small" /> Product Type:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.company?.product_type || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Badge fontSize="small" /> Status:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: selectedMerchant.approval_status === 'approved' ? '#4caf50' : selectedMerchant.approval_status === 'rejected' ? '#f44336' : '#ff9800',
                      color: 'white'
                    }}>
                      {selectedMerchant.approval_status || 'pending'}
                    </span>
                  </Box>
                </Box>
              </Box>
              
              {/* Location Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #ff9800', fontWeight: 600, fontSize: '1.1rem', color: '#ff9800' }}>
                  <LocationOn /> Location Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Home fontSize="small" /> Address:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.company?.address || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> City:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.address?.city || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> Postal Code:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{selectedMerchant.address?.zipcode || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Documents */}
              {selectedMerchant.company?.business_document && (
                <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #4caf50', fontWeight: 600, fontSize: '1.1rem', color: '#4caf50' }}>
                    <Description /> Business Document
                  </Typography>
                  <Button 
                    variant="contained"
                    onClick={() => window.open(`http://127.0.0.1:8000/storage/${selectedMerchant.company.business_document}`, '_blank')}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      textTransform: 'capitalize',
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    View Business Document
                  </Button>
                </Box>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', background: '#f8f9fa' }}>
          <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ borderRadius: '12px', textTransform: 'none', px: 4 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
})

export default Merchants
