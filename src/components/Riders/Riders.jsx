import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip
} from '@mui/material'
import { Add, Visibility, Edit, Delete } from '@mui/icons-material'
import axios from 'axios'

const Riders = () => {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewDialog, setViewDialog] = useState({ open: false, rider: null })
  const [editDialog, setEditDialog] = useState({ open: false, rider: null })
  const [addDialog, setAddDialog] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    status: 'Active'
  })
  const [addLoading, setAddLoading] = useState(false)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockRiders = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        city: 'New York',
        status: 'Active',
        rating: 4.5,
        totalDeliveries: 150
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        city: 'Los Angeles',
        status: 'Active',
        rating: 4.8,
        totalDeliveries: 200
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567892',
        city: 'Chicago',
        status: 'Inactive',
        rating: 4.2,
        totalDeliveries: 75
      }
    ]
    
    setTimeout(() => {
      setRiders(mockRiders)
      setLoading(false)
    }, 1000)
  }, [])

  const handleViewDetails = (rider) => {
    setViewDialog({ open: true, rider })
  }

  const handleEdit = (rider) => {
    setEditDialog({ open: true, rider })
  }

  const handleDelete = (rider) => {
    if (window.confirm(`Are you sure you want to delete ${rider.name}?`)) {
      setRiders(riders.filter(r => r.id !== rider.id))
    }
  }

  const handleAddRider = async () => {
    if (!addFormData.name || !addFormData.email || !addFormData.phone || !addFormData.city) {
      alert('Please fill all required fields')
      return
    }

    setAddLoading(true)
    try {
      const riderData = {
        name: addFormData.name,
        email: addFormData.email,
        phone: addFormData.phone,
        city: addFormData.city,
        vehicle_type: 'Bike',
        status: addFormData.status
      }
      
      console.log('Sending rider data:', riderData)
      const response = await axios.post('http://127.0.0.1:8000/api/riders', riderData)
      console.log('Response:', response.data)
      alert('Rider added successfully!')
      
      // Reset form and close dialog
      setAddFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        status: 'Active'
      })
      setAddDialog(false)
    } catch (error) {
      console.error('Error adding rider:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error adding rider: ${error.response?.data?.message || error.message}`)
    } finally {
      setAddLoading(false)
    }
  }

  const handleAddFormChange = (field) => (e) => {
    setAddFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading riders...</Typography>
      </Box>
    )
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Riders Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialog(true)}
        >
          Add Rider
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riders.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell>{rider.id}</TableCell>
                <TableCell>{rider.name}</TableCell>
                <TableCell>{rider.email}</TableCell>
                <TableCell>{rider.phone}</TableCell>
                <TableCell>{rider.city}</TableCell>
                <TableCell>
                  <Chip 
                    label={rider.status} 
                    color={getStatusColor(rider.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{rider.rating}/5</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary" onClick={() => handleViewDetails(rider)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="warning" onClick={() => handleEdit(rider)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(rider)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialog.open} 
        onClose={() => setViewDialog({ open: false, rider: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Rider Details</DialogTitle>
        <DialogContent>
          {viewDialog.rider && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Name:</strong> {viewDialog.rider.name}</Typography>
              <Typography><strong>Email:</strong> {viewDialog.rider.email}</Typography>
              <Typography><strong>Phone:</strong> {viewDialog.rider.phone}</Typography>
              <Typography><strong>City:</strong> {viewDialog.rider.city}</Typography>
              <Typography><strong>Status:</strong> {viewDialog.rider.status}</Typography>
              <Typography><strong>Rating:</strong> {viewDialog.rider.rating}/5</Typography>
              <Typography><strong>Total Deliveries:</strong> {viewDialog.rider.totalDeliveries}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, rider: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, rider: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Rider</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              defaultValue={editDialog.rider?.name}
              fullWidth
            />
            <TextField
              label="Email"
              defaultValue={editDialog.rider?.email}
              fullWidth
            />
            <TextField
              label="Phone"
              defaultValue={editDialog.rider?.phone}
              fullWidth
            />
            <TextField
              label="City"
              defaultValue={editDialog.rider?.city}
              fullWidth
            />
            <TextField
              select
              label="Status"
              defaultValue={editDialog.rider?.status}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, rider: null })}>
            Cancel
          </Button>
          <Button variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Rider Dialog */}
      <Dialog 
        open={addDialog} 
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Rider</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name *"
              value={addFormData.name}
              onChange={handleAddFormChange('name')}
              fullWidth
              required
            />
            <TextField
              label="Email *"
              type="email"
              value={addFormData.email}
              onChange={handleAddFormChange('email')}
              fullWidth
              required
            />
            <TextField
              label="Phone *"
              value={addFormData.phone}
              onChange={handleAddFormChange('phone')}
              fullWidth
              required
            />
            <TextField
              label="City *"
              value={addFormData.city}
              onChange={handleAddFormChange('city')}
              fullWidth
              required
            />
            <TextField
              select
              label="Status"
              value={addFormData.status}
              onChange={handleAddFormChange('status')}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddRider} disabled={addLoading}>
            {addLoading ? 'Adding...' : 'Add Rider'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Riders