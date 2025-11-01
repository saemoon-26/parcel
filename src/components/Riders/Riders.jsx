import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import axios from 'axios'

const Riders = memo(function Riders() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingRider, setEditingRider] = useState(null)
  const formDataRef = useRef({
    first_name: '',
    last_name: '',
    email: '',
    per_parcel_payout: '',
    city: '',
    address: '',
    country: '',
    state: '',
    zipcode: ''
  })

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/riders", {
          timeout: 10000
        })
        setRiders(response.data.data)
      } catch (error) {
        console.error('API Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRiders()
  }, [])

  const handleFieldChange = (field) => (e) => {
    formDataRef.current[field] = e.target.value
  }

  const handleSubmit = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/riders', formDataRef.current, { timeout: 10000 })
      setOpen(false)
      formDataRef.current = {
        first_name: '',
        last_name: '',
        email: '',
        per_parcel_payout: '',
        city: '',
        address: '',
        country: '',
        state: '',
        zipcode: ''
      }
      // Refresh riders list
      const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
      setRiders(response.data.data)
      alert('Rider added successfully!')
    } catch (error) {
      console.error('Error adding rider:', error)
      
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : 'Please check console for details'
      
      alert(`Validation Error: ${errorMessages}`)
    }
  }

  const handleEdit = useCallback((rider) => {
    setEditingRider(rider)
    formDataRef.current = {
      first_name: rider.first_name || '',
      last_name: rider.last_name || '',
      email: rider.email || '',
      per_parcel_payout: rider.per_parcel_payout || '',
      city: rider.address?.city || '',
      address: rider.address?.address || '',
      country: rider.address?.country || '',
      state: rider.address?.state || '',
      zipcode: rider.address?.zipcode || ''
    }
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this rider?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/riders/${id}`, { timeout: 10000 })
        const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
        setRiders(response.data.data)
        alert('Rider deleted successfully!')
      } catch (error) {
        console.error('Error deleting rider:', error)
        const errorMessage = error.response?.status === 500 
          ? 'Server error: Cannot delete rider. It may be associated with other records.'
          : error.response?.data?.message || 'Error deleting rider'
        alert(errorMessage)
      }
    }
  }, [])

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/riders/${editingRider.id}`, formDataRef.current, { timeout: 10000 })
      setEditOpen(false)
      setEditingRider(null)
      formDataRef.current = {
        first_name: '',
        last_name: '',
        email: '',
        per_parcel_payout: '',
        city: '',
        address: '',
        country: '',
        state: '',
        zipcode: ''
      }
      const response = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
      setRiders(response.data.data)
      alert('Rider updated successfully!')
    } catch (error) {
      console.error('Error updating rider:', error)
      
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
              <TableCell style={{color: 'white'}}>ID</TableCell>
              <TableCell style={{color: 'white'}}>First Name</TableCell>
              <TableCell style={{color: 'white'}}>Last Name</TableCell>
              <TableCell style={{color: 'white'}}>Email</TableCell>
              <TableCell style={{color: 'white'}}>Per Parcel Payout</TableCell>
              <TableCell style={{color: 'white'}}>City</TableCell>
              <TableCell style={{color: 'white'}}>Address</TableCell>
              <TableCell style={{color: 'white'}}>State</TableCell>
              <TableCell style={{color: 'white'}}>Country</TableCell>
              <TableCell style={{color: 'white'}}>Zipcode</TableCell>
              <TableCell style={{color: 'white'}}>Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riders.length > 0 ? riders.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell>{rider.id}</TableCell>
                <TableCell>{rider.first_name}</TableCell>
                <TableCell>{rider.last_name}</TableCell>
                <TableCell>{rider.email}</TableCell>
                <TableCell>Rs. {rider.per_parcel_payout}</TableCell>
                <TableCell>{rider.address?.city || 'N/A'}</TableCell>
                <TableCell>{rider.address?.address || 'N/A'}</TableCell>
                <TableCell>{rider.address?.state || 'N/A'}</TableCell>
                <TableCell>{rider.address?.country || 'N/A'}</TableCell>
                <TableCell>{rider.address?.zipcode || 'N/A'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit Rider">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(rider)}>
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
                <TableCell colSpan={11} style={{textAlign: 'center'}}>
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
          <Button onClick={handleSubmit} variant="contained">Add Rider</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth disablePortal key={editOpen ? 'edit-open' : 'edit-closed'}>
        <DialogTitle>Edit Rider</DialogTitle>
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
          <Button onClick={handleEditSubmit} variant="contained">Update Rider</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
})

export default Riders