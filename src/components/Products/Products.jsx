import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, QrCodeScanner } from '@mui/icons-material'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'

const Products = () => {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingParcel, setEditingParcel] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [formData, setFormData] = useState({
    tracking_code: '',
    client_name: '',
    client_phone_number: '',
    client_address: '',
    client_email: '',
    pickup_location: '',
    dropoff_location: '',
    assigned_to: '',
    parcel_status: 'pending',
    payment_method: '',
    rider_payout: '',
    company_payout: ''
  })
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)

  const fetchParcels = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/parcels", { timeout: 10000 })
      setParcels(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching parcels:', error.message)
      setParcels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }, [])

  const handleScan = useCallback((decodedText) => {
    try {
      console.log('Scanned text:', decodedText)
      
      // Stop scanner immediately
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      
      let qrData
      try {
        qrData = JSON.parse(decodedText)
      } catch {
        // If not JSON, treat as tracking code
        qrData = { tracking_code: decodedText }
      }
      
      console.log('Parsed QR data:', qrData)
      
      // Update form state immediately
      setFormData(prev => {
        const updated = { ...prev }
        Object.keys(qrData).forEach(key => {
          if (updated.hasOwnProperty(key)) {
            updated[key] = qrData[key]
          }
        })
        return updated
      })
      
      // Close scanner dialog
      setScannerOpen(false)
      alert('QR Code scan successful! ✅')
      
    } catch (error) {
      console.error('QR scan error:', error)
      alert('QR Code scan failed ❌')
    }
  }, [])

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      const html5QrCode = new Html5Qrcode('file-reader')
      html5QrCode.scanFile(file, true)
        .then(decodedText => {
          handleScan(decodedText)
        })
        .catch(err => {
          alert('Could not scan QR code from image')
        })
    }
  }, [handleScan])

  useEffect(() => {
    if (scannerOpen) {
      const initScanner = async () => {
        try {
          const element = document.getElementById('qr-reader')
          if (element && !scannerRef.current) {
            // Clear any existing content
            element.innerHTML = ''
            
            const config = {
              fps: 30,
              qrbox: { width: 280, height: 280 },
              aspectRatio: 1.0,
              disableFlip: false,
              rememberLastUsedCamera: true,
              supportedScanTypes: [0],
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
              },
              videoConstraints: {
                facingMode: { ideal: "environment" },
                width: { ideal: 640 },
                height: { ideal: 480 }
              },
              formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8]
            }
            
            const scanner = new Html5QrcodeScanner('qr-reader', config, false)
            scannerRef.current = scanner
            
            scanner.render(
              (decodedText) => {
                console.log('QR Code detected:', decodedText)
                handleScan(decodedText)
              },
              (error) => {
                // Silent error for continuous scanning
              }
            )
          }
        } catch (error) {
          console.error('Scanner initialization error:', error)
        }
      }
      
      const timer = setTimeout(initScanner, 200)
      
      return () => {
        clearTimeout(timer)
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {})
          scannerRef.current = null
        }
      }
    }
  }, [scannerOpen, handleScan])

  const handleSubmit = useCallback(async () => {
    if (!formData.pickup_location.trim()) {
      alert('Pickup location is required')
      return
    }
    if (!formData.dropoff_location.trim()) {
      alert('Dropoff location is required')
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/parcels', formData, { timeout: 10000 })
      setOpen(false)
      setFormData({
        tracking_code: '',
        client_name: '',
        client_phone_number: '',
        client_address: '',
        client_email: '',
        pickup_location: '',
        dropoff_location: '',
        assigned_to: '',
        parcel_status: 'pending',
        payment_method: '',
        rider_payout: '',
        company_payout: ''
      })
      fetchParcels()
      alert('Parcel added successfully!')
    } catch (error) {
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Error adding parcel'
      alert(`Error: ${errorMessages}`)
    }
  }, [formData, fetchParcels])

  const handleEdit = useCallback((parcel) => {
    setEditingParcel(parcel)
    setFormData({
      tracking_code: parcel.tracking_code || '',
      client_name: parcel.details?.client_name || '',
      client_phone_number: parcel.details?.client_phone_number || '',
      client_address: parcel.details?.client_address || '',
      client_email: parcel.details?.client_email || '',
      pickup_location: parcel.pickup_location || '',
      dropoff_location: parcel.dropoff_location || '',
      assigned_to: parcel.assigned_to || '',
      parcel_status: parcel.parcel_status || 'pending',
      payment_method: parcel.payment_method || '',
      rider_payout: parcel.rider_payout || '',
      company_payout: parcel.company_payout || ''
    })
    setEditOpen(true)
  }, [])

  const handleEditSubmit = useCallback(async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/parcels/${editingParcel.parcel_id}`, formData, { timeout: 10000 })
      setEditOpen(false)
      setEditingParcel(null)
      fetchParcels()
      alert('Parcel updated successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating parcel')
    }
  }, [editingParcel, formData, fetchParcels])

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this parcel?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/parcels/${id}`, { timeout: 10000 })
        fetchParcels()
        alert('Parcel deleted successfully!')
      } catch (error) {
        alert('Error deleting parcel')
      }
    }
  }, [fetchParcels])

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'delivered': return 'success'
      case 'in_transit': return 'warning'
      case 'pending': return 'error'
      default: return 'default'
    }
  }, [])

  const memoizedParcels = useMemo(() => parcels, [parcels])

  if (loading) {
    return <div style={{textAlign: 'center', padding: '20px', fontSize: '18px'}}>Loading...</div>
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <p>Total Parcels: {memoizedParcels.length}</p>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New Parcel
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <TableCell style={{color: 'white'}}>Tracking Code</TableCell>
              <TableCell style={{color: 'white'}}>Client Name</TableCell>
              <TableCell style={{color: 'white'}}>Phone</TableCell>
              <TableCell style={{color: 'white'}}>Address</TableCell>
              <TableCell style={{color: 'white'}}>Email</TableCell>
              <TableCell style={{color: 'white'}}>Pickup</TableCell>
              <TableCell style={{color: 'white'}}>Dropoff</TableCell>
              <TableCell style={{color: 'white'}}>Assigned To</TableCell>
              <TableCell style={{color: 'white'}}>Status</TableCell>
              <TableCell style={{color: 'white'}}>Payment</TableCell>
              <TableCell style={{color: 'white'}}>Rider Payout</TableCell>
              <TableCell style={{color: 'white'}}>Company Payout</TableCell>
              <TableCell style={{color: 'white'}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(memoizedParcels) && memoizedParcels.map((item) => (
              <TableRow key={item.parcel_id}>
                <TableCell>{item.tracking_code || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_name || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_phone_number || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_address || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_email || 'N/A'}</TableCell>
                <TableCell>{item.pickup_location || 'N/A'}</TableCell>
                <TableCell>{item.dropoff_location || 'N/A'}</TableCell>
                <TableCell>{item.assigned_to || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.parcel_status || 'pending'} 
                    color={getStatusColor(item.parcel_status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.payment_method || 'N/A'}</TableCell>
                <TableCell>Rs. {item.rider_payout || '0'}</TableCell>
                <TableCell>Rs. {item.company_payout || '0'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.parcel_id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!Array.isArray(memoizedParcels) || memoizedParcels.length === 0) && (
              <TableRow>
                <TableCell colSpan={13} style={{textAlign: 'center'}}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Add New Parcel
            <Button startIcon={<QrCodeScanner />} onClick={() => setScannerOpen(true)} variant="outlined" size="small">
              Scan QR
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField name="tracking_code" label="Tracking Code" value={formData.tracking_code} onChange={handleChange} fullWidth />
            <TextField name="client_name" label="Client Name" value={formData.client_name} onChange={handleChange} fullWidth />
            <TextField name="client_phone_number" label="Phone" value={formData.client_phone_number} onChange={handleChange} fullWidth />
            <TextField name="client_address" label="Address" value={formData.client_address} onChange={handleChange} fullWidth />
            <TextField name="client_email" label="Email" value={formData.client_email} onChange={handleChange} fullWidth />
            <TextField name="pickup_location" label="Pickup Location *" value={formData.pickup_location} onChange={handleChange} fullWidth required />
            <TextField name="dropoff_location" label="Dropoff Location *" value={formData.dropoff_location} onChange={handleChange} fullWidth required />
            <TextField name="assigned_to" label="Assigned To (Rider ID)" type="number" value={formData.assigned_to} onChange={handleChange} fullWidth />
            <TextField name="parcel_status" label="Status" value={formData.parcel_status} onChange={handleChange} fullWidth />
            <TextField name="payment_method" label="Payment Method" value={formData.payment_method} onChange={handleChange} fullWidth />
            <TextField name="rider_payout" label="Rider Payout" type="number" value={formData.rider_payout} onChange={handleChange} fullWidth />
            <TextField name="company_payout" label="Company Payout" type="number" value={formData.company_payout} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scannerOpen} onClose={() => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {})
          scannerRef.current = null
        }
        setScannerOpen(false)
      }} maxWidth="md" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} p={1}>
            <Box display="flex" justifyContent="center" gap={2} mb={2}>
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Box>
            <Box display="flex" justifyContent="center" style={{ minHeight: '400px' }}>
              <div id="qr-reader" style={{ width: '100%', maxWidth: '500px' }}></div>
              <div id="file-reader" style={{ display: 'none' }}></div>
            </Box>
            <Box textAlign="center" mt={2}>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>📱 QR code ko camera ke samnay rakhen</p>
              <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>Camera permission allow karna zaroori hai</p>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(() => {})
              scannerRef.current = null
            }
            setScannerOpen(false)
          }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Parcel</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField name="tracking_code" label="Tracking Code" value={formData.tracking_code} onChange={handleChange} fullWidth />
            <TextField name="client_name" label="Client Name" value={formData.client_name} onChange={handleChange} fullWidth />
            <TextField name="client_phone_number" label="Phone" value={formData.client_phone_number} onChange={handleChange} fullWidth />
            <TextField name="client_address" label="Address" value={formData.client_address} onChange={handleChange} fullWidth />
            <TextField name="client_email" label="Email" value={formData.client_email} onChange={handleChange} fullWidth />
            <TextField name="pickup_location" label="Pickup Location" value={formData.pickup_location} onChange={handleChange} fullWidth />
            <TextField name="dropoff_location" label="Dropoff Location" value={formData.dropoff_location} onChange={handleChange} fullWidth />
            <TextField name="assigned_to" label="Assigned To (Rider ID)" type="number" value={formData.assigned_to} onChange={handleChange} fullWidth />
            <TextField name="parcel_status" label="Status" value={formData.parcel_status} onChange={handleChange} fullWidth />
            <TextField name="payment_method" label="Payment Method" value={formData.payment_method} onChange={handleChange} fullWidth />
            <TextField name="rider_payout" label="Rider Payout" type="number" value={formData.rider_payout} onChange={handleChange} fullWidth />
            <TextField name="company_payout" label="Company Payout" type="number" value={formData.company_payout} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default memo(Products)