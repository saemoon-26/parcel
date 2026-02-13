import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar
} from '@mui/material'
import { Visibility, CheckCircle, Cancel, Delete } from '@mui/icons-material'
import axios from 'axios'

const RegisteredRiders = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewDialog, setViewDialog] = useState({ open: false, rider: null })

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rider-registrations')
      const data = response.data
      
      // Handle different response structures
      if (Array.isArray(data)) {
        setRegistrations(data)
      } else if (data.data && Array.isArray(data.data)) {
        setRegistrations(data.data)
      } else if (data.riders && Array.isArray(data.riders)) {
        setRegistrations(data.riders)
      } else {
        setRegistrations([])
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      alert('Unable to fetch registrations. Please check backend connection.')
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this rider?')) {
      try {
        await axios.post(`http://localhost:8000/api/rider-registrations/${id}/approve`)
        alert('Rider approved successfully!')
        fetchRegistrations()
      } catch (error) {
        console.error('Error approving rider:', error)
        alert(`Error: ${error.response?.data?.message || error.message}`)
      }
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        await axios.post(`http://localhost:8000/api/rider-registrations/${id}/reject`, { 
          rejection_reason: reason 
        })
        alert('Rider rejected successfully!')
        fetchRegistrations()
      } catch (error) {
        console.error('Error rejecting rider:', error)
        alert(`Error: ${error.response?.data?.message || error.message}`)
      }
    }
  }

  const handleViewDetails = (rider) => {
    setViewDialog({ open: true, rider })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading registered riders...</Typography>
      </Box>
    )
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          All Registrations ({registrations.length})
        </Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            onClick={fetchRegistrations}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>

        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.length > 0 ? registrations.map((rider) => (
              <TableRow key={rider.id} style={{ 
                backgroundColor: rider.status === 'approved' ? '#e8f5e8' : 
                                rider.status === 'rejected' ? '#ffeaea' : 'transparent'
              }}>
                <TableCell>{rider.full_name || 'N/A'}</TableCell>
                <TableCell>{rider.email || 'N/A'}</TableCell>
                <TableCell>{rider.mobile_primary || 'N/A'}</TableCell>
                <TableCell>{rider.city || 'N/A'}</TableCell>
                <TableCell>{(rider.vehicle_type || 'N/A') + ' - ' + (rider.vehicle_brand || 'N/A')}</TableCell>
                <TableCell>
                  {rider.status === 'approved' ? (
                    <Chip label="Approved" color="success" size="small" />
                  ) : rider.status === 'rejected' ? (
                    <Chip label="Rejected" color="error" size="small" />
                  ) : (
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewDetails(rider)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton size="small" color="success" onClick={() => handleApprove(rider.id)}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton size="small" color="error" onClick={() => handleReject(rider.id)}>
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} style={{textAlign: 'center', padding: '20px'}}>
                  No pending registrations found
                </TableCell>
              </TableRow>
            )}
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
        <DialogTitle>
          Registration Details - {viewDialog.rider?.full_name}
        </DialogTitle>
        <DialogContent>
          {viewDialog.rider && (
            <div style={{ marginTop: '8px' }}>
              
              {/* Personal Information */}
              <div style={{ marginBottom: '16px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Personal Information</Typography>
                <Typography><strong>Full Name:</strong> {viewDialog.rider.full_name}</Typography>
                <Typography><strong>Father Name:</strong> {viewDialog.rider.father_name}</Typography>
                <Typography><strong>CNIC:</strong> {viewDialog.rider.cnic_number}</Typography>
                <Typography><strong>Email:</strong> {viewDialog.rider.email}</Typography>
                <Typography><strong>Primary Phone:</strong> {viewDialog.rider.mobile_primary}</Typography>
                <Typography><strong>Alternate Phone:</strong> {viewDialog.rider.mobile_alternate || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {viewDialog.rider.address}</Typography>
              </div>
              
              {/* Location */}
              <div style={{ marginBottom: '16px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#ff9800' }}>Location</Typography>
                <Typography><strong>City:</strong> {viewDialog.rider.city}</Typography>
                <Typography><strong>State:</strong> {viewDialog.rider.state}</Typography>
              </div>
              
              {/* Vehicle Information */}
              <div style={{ marginBottom: '16px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>Vehicle Information</Typography>
                <Typography><strong>Type:</strong> {viewDialog.rider.vehicle_type}</Typography>
                <Typography><strong>Brand:</strong> {viewDialog.rider.vehicle_brand}</Typography>
                <Typography><strong>Model:</strong> {viewDialog.rider.vehicle_model}</Typography>
                <Typography><strong>Registration:</strong> {viewDialog.rider.vehicle_registration}</Typography>
                <Typography><strong>License Number:</strong> {viewDialog.rider.driving_license_number}</Typography>
              </div>
              
              {/* Bank Details */}
              {(viewDialog.rider.bank_name || viewDialog.rider.account_number) && (
                <div style={{ marginBottom: '16px' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#9c27b0' }}>Bank Details</Typography>
                  <Typography><strong>Bank:</strong> {viewDialog.rider.bank_name || 'N/A'}</Typography>
                  <Typography><strong>Account Number:</strong> {viewDialog.rider.account_number || 'N/A'}</Typography>
                  <Typography><strong>Account Title:</strong> {viewDialog.rider.account_title || 'N/A'}</Typography>
                </div>
              )}
              
              {/* Documents */}
              <div>
                <Typography variant="h6" sx={{ mb: 2, color: '#f44336' }}>Documents</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {viewDialog.rider.profile_picture && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.profile_picture}`, '_blank')}
                    >
                      Profile Picture
                    </Button>
                  )}
                  {viewDialog.rider.cnic_front_image && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.cnic_front_image}`, '_blank')}
                    >
                      CNIC Front
                    </Button>
                  )}
                  {viewDialog.rider.cnic_back_image && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.cnic_back_image}`, '_blank')}
                    >
                      CNIC Back
                    </Button>
                  )}
                  {viewDialog.rider.driving_license_image && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.driving_license_image}`, '_blank')}
                    >
                      License Image
                    </Button>
                  )}
                  {viewDialog.rider.vehicle_registration_book && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.vehicle_registration_book}`, '_blank')}
                    >
                      Vehicle Book
                    </Button>
                  )}
                  {viewDialog.rider.vehicle_image && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.vehicle_image}`, '_blank')}
                    >
                      Vehicle Image
                    </Button>
                  )}
                  {viewDialog.rider.electricity_bill && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => window.open(`http://127.0.0.1:8000/uploads/${viewDialog.rider.electricity_bill}`, '_blank')}
                    >
                      Electricity Bill
                    </Button>
                  )}
                </Box>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleReject(viewDialog.rider?.id)} color="error">
            Reject
          </Button>
          <Button onClick={() => handleApprove(viewDialog.rider?.id)} color="success" variant="contained">
            Approve
          </Button>
          <Button onClick={() => setViewDialog({ open: false, rider: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default RegisteredRiders