import { useState, useEffect } from 'react'
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, Chip, IconButton, Grid, TextField, Select, MenuItem, 
  FormControl, InputLabel, Avatar
} from '@mui/material'
import { 
  Visibility, Edit, Delete, CheckCircle, Cancel, Person, 
  DirectionsCar, Description, Phone, Email, LocationOn 
} from '@mui/icons-material'
import axios from 'axios'

const RegisteredRidersPage = () => {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRider, setSelectedRider] = useState(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    fetchRiders()
  }, [])

  const fetchRiders = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/rider-registrations')
      setRiders(response.data)
    } catch (error) {
      console.error('Error fetching riders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (riderId, newStatus) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/rider-registrations/${riderId}/status`, {
        status: newStatus
      })
      fetchRiders()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/rider-registrations/${selectedRider.id}`)
      setDeleteDialog(false)
      fetchRiders()
    } catch (error) {
      console.error('Error deleting rider:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'warning'
    }
  }

  const ViewDialog = () => (
    <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Person />
          </Avatar>
          Rider Registration Details
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedRider && (
          <Grid container spacing={3}>
            {/* Personal Info */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Name:</strong> {selectedRider.full_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Father Name:</strong> {selectedRider.father_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>CNIC:</strong> {selectedRider.cnic_number}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Email:</strong> {selectedRider.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Primary Mobile:</strong> {selectedRider.mobile_primary}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Alternate Mobile:</strong> {selectedRider.mobile_alternate || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><strong>Address:</strong> {selectedRider.address}</Typography>
            </Grid>

            {/* Vehicle Info */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Vehicle Information
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Type:</strong> {selectedRider.vehicle_type}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Brand:</strong> {selectedRider.vehicle_brand}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Model:</strong> {selectedRider.vehicle_model}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Registration:</strong> {selectedRider.vehicle_registration}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>License:</strong> {selectedRider.driving_license_number}</Typography>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Location & Bank Details
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>City:</strong> {selectedRider.city}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>State:</strong> {selectedRider.state}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Bank:</strong> {selectedRider.bank_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Account:</strong> {selectedRider.account_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography><strong>Title:</strong> {selectedRider.account_title || 'N/A'}</Typography>
            </Grid>

            {/* Registration Date */}
            <Grid item xs={12}>
              <Typography sx={{ mt: 2 }}><strong>Registered:</strong> {new Date(selectedRider.id).toLocaleDateString()}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  )

  const DeleteDialog = () => (
    <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete {selectedRider?.full_name}'s registration?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Registered Riders Management
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Registration ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {riders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell>{rider.full_name}</TableCell>
                  <TableCell>{rider.mobile_primary}</TableCell>
                  <TableCell>{rider.email}</TableCell>
                  <TableCell>{rider.vehicle_type} - {rider.vehicle_brand}</TableCell>
                  <TableCell>{rider.city}</TableCell>
                  <TableCell>{rider.id}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => {
                        setSelectedRider(rider)
                        setViewDialog(true)
                      }}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => {
                        setSelectedRider(rider)
                        setDeleteDialog(true)
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ViewDialog />
      <DeleteDialog />
    </Box>
  )
}

export default RegisteredRidersPage