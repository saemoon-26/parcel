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
import { Visibility, CheckCircle, Cancel, Delete, Person, Phone, Email, Home, CreditCard, Badge, LocationOn, DirectionsCar, Description, AccountBalance } from '@mui/icons-material'
import axios from 'axios'

const RegisteredRiders = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewDialog, setViewDialog] = useState({ open: false, rider: null })

  useEffect(() => {
    // Test backend connection first
    axios.get('http://127.0.0.1:8000/api/test')
      .then(response => {
        console.log('Backend connection test successful:', response.data)
        fetchRegistrations()
      })
      .catch(error => {
        console.error('Backend connection test failed:', error)
        alert('Backend server is not running or not accessible at http://127.0.0.1:8000\n\nPlease start the Laravel server with: php artisan serve')
        setLoading(false)
      })
  }, [])

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations from: http://127.0.0.1:8000/api/rider-registrations')
      const response = await axios.get('http://127.0.0.1:8000/api/rider-registrations')
      console.log('Response status:', response.status)
      const data = response.data
      console.log('Backend Response:', data)
      console.log('Response data type:', typeof data)
      console.log('Is array?', Array.isArray(data))
      console.log('Has data property?', data.data)
      
      // Handle different response structures
      if (Array.isArray(data)) {
        console.log('Setting registrations from array:', data.length)
        setRegistrations(data)
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Setting registrations from data.data:', data.data.length)
        setRegistrations(data.data)
      } else if (data.riders && Array.isArray(data.riders)) {
        console.log('Setting registrations from data.riders:', data.riders.length)
        setRegistrations(data.riders)
      } else {
        console.log('No valid data structure found, setting empty array')
        setRegistrations([])
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      alert(`Unable to fetch registrations. Error: ${error.message}\n\nPlease check:\n1. Backend server is running on http://127.0.0.1:8000\n2. CORS is enabled\n3. Database connection is working`)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this rider?')) {
      try {
        console.log('Approving rider ID:', id)
        const response = await axios.post(`http://127.0.0.1:8000/api/rider-registrations/${id}/approve`)
        console.log('Approve response:', response.data)
        alert('Rider approved successfully!')
        fetchRegistrations()
      } catch (error) {
        console.error('Error approving rider:', error)
        console.error('Error response:', error.response?.data)
        alert(`Error: ${error.response?.data?.message || error.message}`)
      }
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/rider-registrations/${id}/reject`, { 
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
    console.log('Rider Details:', rider)
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
                backgroundColor: rider.status === 'active' ? '#e8f5e8' : 
                                rider.status === 'rejected' ? '#ffeaea' : 'transparent'
              }}>
                <TableCell>{rider.full_name || rider.first_name + ' ' + rider.last_name || 'N/A'}</TableCell>
                <TableCell>{rider.email || 'N/A'}</TableCell>
                <TableCell>{rider.mobile_primary || rider.phone_number || 'N/A'}</TableCell>
                <TableCell>{rider.city || 'N/A'}</TableCell>
                <TableCell>{rider.vehicle?.vehicle_type || rider.vehicle_type || 'N/A'} - {rider.vehicle?.vehicle_brand || rider.vehicle_brand || 'N/A'}</TableCell>
                <TableCell>
                  {rider.status === 'active' ? (
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
            src={viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture')?.document_path ? `http://127.0.0.1:8000/storage/${viewDialog.rider.documents.find(doc => doc.document_type === 'profile_picture').document_path}` : undefined}
            sx={{ 
              width: 80, 
              height: 80, 
              border: '4px solid white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture') ? 'pointer' : 'default',
              transition: 'transform 0.3s ease',
              '&:hover': viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture') ? {
                transform: 'scale(1.1)'
              } : {}
            }}
            onClick={() => {
              const profilePic = viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture')
              if (profilePic) window.open(`http://127.0.0.1:8000/storage/${profilePic.document_path}`, '_blank')
            }}
          >
            {!viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture') && <Person sx={{ fontSize: 40 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {viewDialog.rider?.full_name || 'Registration Details'}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>ID: {viewDialog.rider?.id}</Typography>
            {viewDialog.rider?.documents?.find(doc => doc.document_type === 'profile_picture') && (
              <Typography sx={{ opacity: 0.8, fontSize: '0.85rem', mt: 0.5 }}>Click photo to view full size</Typography>
            )}
          </Box>
        </Box>
        <DialogContent sx={{ padding: '24px', background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)' }}>
          {viewDialog.rider && (
            <div style={{ marginTop: '8px' }}>
              
              {/* Personal Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', color: '#1976d2' }}>
                  <Person /> Personal Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Badge fontSize="small" /> Full Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.full_name || `${viewDialog.rider.first_name} ${viewDialog.rider.last_name}` || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Person fontSize="small" /> Father Name:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.father_name || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> CNIC:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.cnic_number || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Email fontSize="small" /> Email:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.email || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Phone fontSize="small" /> Primary Phone:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.mobile_primary || viewDialog.rider.phone_number || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Phone fontSize="small" /> Alternate Phone:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.mobile_alternate || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Home fontSize="small" /> Address:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.address || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Location */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #ff9800', fontWeight: 600, fontSize: '1.1rem', color: '#ff9800' }}>
                  <LocationOn /> Location
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> City:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.city || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn fontSize="small" /> State:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.state || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Vehicle Information */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #4caf50', fontWeight: 600, fontSize: '1.1rem', color: '#4caf50' }}>
                  <DirectionsCar /> Vehicle Information
                </Typography>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Type:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.vehicle?.vehicle_type || viewDialog.rider.vehicle_type || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Brand:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.vehicle?.vehicle_brand || viewDialog.rider.vehicle_brand || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><DirectionsCar fontSize="small" /> Model:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.vehicle?.vehicle_model || viewDialog.rider.vehicle_model || 'N/A'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Description fontSize="small" /> Registration:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.vehicle?.vehicle_registration || viewDialog.rider.vehicle_registration || 'Not Provided'}</Box>
                </Box>
                <Box sx={{ display: 'flex', padding: '10px 0' }}>
                  <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> License Number:</Box>
                  <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.driving_license_number || 'N/A'}</Box>
                </Box>
              </Box>
              
              {/* Bank Details */}
              {(viewDialog.rider.bank?.bank_name || viewDialog.rider.bank_name || viewDialog.rider.bank?.account_number || viewDialog.rider.account_number) && (
                <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #9c27b0', fontWeight: 600, fontSize: '1.1rem', color: '#9c27b0' }}>
                    <AccountBalance /> Bank Details
                  </Typography>
                  <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><AccountBalance fontSize="small" /> Bank:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.bank?.bank_name || viewDialog.rider.bank_name || 'N/A'}</Box>
                  </Box>
                  <Box sx={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><CreditCard fontSize="small" /> Account Number:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.bank?.account_number || viewDialog.rider.account_number || 'Not Provided'}</Box>
                  </Box>
                  <Box sx={{ display: 'flex', padding: '10px 0' }}>
                    <Box sx={{ fontWeight: 600, color: '#555', minWidth: '160px', display: 'flex', alignItems: 'center', gap: 1 }}><Person fontSize="small" /> Account Title:</Box>
                    <Box sx={{ color: '#333', flex: 1 }}>{viewDialog.rider.bank?.account_title || viewDialog.rider.account_title || 'N/A'}</Box>
                  </Box>
                </Box>
              )}
              
              {/* Documents */}
              <Box sx={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2, paddingBottom: 1.5, borderBottom: '2px solid #f44336', fontWeight: 600, fontSize: '1.1rem', color: '#f44336' }}>
                  <Description /> Documents
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5, marginTop: 1.5 }}>
                  {viewDialog.rider.documents?.length > 0 ? (
                    viewDialog.rider.documents.map((doc, idx) => (
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
        <DialogActions sx={{ padding: '16px 24px', background: '#f8f9fa', gap: 1 }}>
          <Button onClick={() => handleReject(viewDialog.rider?.id)} color="error" variant="outlined" sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}>
            Reject
          </Button>
          <Button onClick={() => handleApprove(viewDialog.rider?.id)} color="success" variant="contained" sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}>
            Approve
          </Button>
          <Button onClick={() => setViewDialog({ open: false, rider: null })} variant="contained" sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default RegisteredRiders