import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Tooltip, Alert, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { Edit, Delete, QrCodeScanner, CheckCircle, LocationOn } from '@mui/icons-material'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'
import FreeMapPicker from '../MapPicker/FreeMapPicker'

const Products = () => {
  const [parcels, setParcels] = useState([])
  const [riders, setRiders] = useState([])
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [riderRequests, setRiderRequests] = useState({})
  const [open, setOpen] = useState(false)
  const [parcelFormOpen, setParcelFormOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [newParcelId, setNewParcelId] = useState(null)
  const tableEndRef = useRef(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingParcel, setEditingParcel] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyParcel, setVerifyParcel] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifyMessage, setVerifyMessage] = useState({ type: '', text: '' })
  const verificationInputRef = useRef(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapType, setMapType] = useState('') // 'pickup' or 'client'
  
  const statusOptions = ['pending', 'picked_up', 'out_for_delivery', 'delivered']
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur']
  const paymentMethods = ['Cash on Delivery', 'JazzCash']
  const [formData, setFormData] = useState({
    tracking_code: '',
    client_name: '',
    client_phone_number: '',
    client_address: '',
    client_email: '',
    pickup_location: '',
    pickup_city: '',
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
      // Fetch parcels and rider requests in parallel
      const [parcelsResponse, requestsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/parcels", { timeout: 10000 }),
        axios.get("http://127.0.0.1:8000/api/parcels/all-rider-requests", { timeout: 10000 })
      ])
      
      const newData = parcelsResponse.data?.data || []
      const allRequests = requestsResponse.data?.data || {}
      
      setParcels(newData)
      setRiderRequests(allRequests)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setParcels([])
      setRiderRequests({})
      setLoading(false)
    }
  }, [])

  const fetchRiders = useCallback(async () => {
    try {
      const ridersRes = await axios.get("http://127.0.0.1:8000/api/riders", { timeout: 10000 })
      const ridersData = Array.isArray(ridersRes.data) ? ridersRes.data : (ridersRes.data?.data || [])
      setRiders(ridersData)
      localStorage.setItem('riders', JSON.stringify(ridersData))
    } catch (error) {
      setRiders([])
    }
  }, [])

  const fetchMerchants = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/merchants", { timeout: 10000 })
      const allMerchants = response.data?.data || []
      
      const approvedMerchants = allMerchants.filter(merchant => {
        return merchant.company?.approval_status === 'approved'
      })
      
      setMerchants(approvedMerchants)
    } catch (error) {
      setMerchants([])
    }
  }, [])

  useEffect(() => {
    fetchParcels()
    fetchRiders()
    fetchMerchants()
  }, [fetchParcels, fetchRiders, fetchMerchants])

  useEffect(() => {
    if (open) {
      axios.get('http://127.0.0.1:8000/api/generate-tracking-code')
        .then(response => {
          setFormData(prev => ({
            ...prev,
            tracking_code: response.data.tracking_code
          }))
        })
        .catch(error => {})
    }
  }, [open])

  // OPTIMIZED: useCallback to prevent re-creating function on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleOpenDialog = useCallback(() => setOpen(true), [])
  const handleCloseDialog = useCallback(() => setOpen(false), [])

  const handleScan = useCallback((decodedText) => {
    try {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      
      let qrData
      try {
        qrData = JSON.parse(decodedText)
      } catch {
        qrData = { tracking_code: decodedText }
      }
      
      setFormData(prev => {
        const updated = { ...prev }
        Object.keys(qrData).forEach(key => {
          if (updated.hasOwnProperty(key)) {
            updated[key] = qrData[key]
          }
        })
        return updated
      })
      
      setScannerOpen(false)
      alert('QR Code scan successful! ✅')
      
    } catch (error) {
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

  // OPTIMIZED: Only run scanner effect when scannerOpen changes
  useEffect(() => {
    if (!scannerOpen) return

    const initScanner = async () => {
      try {
        const element = document.getElementById('qr-reader')
        if (element && !scannerRef.current) {
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
              handleScan(decodedText)
            },
            (error) => {
            }
          )
        }
      } catch (error) {
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
  }, [scannerOpen, handleScan])

  const handleSubmit = useCallback(async () => {
    // Validate client name - only alphabets and spaces
    if (!formData.client_name.trim()) {
      alert('⚠️ Client Name is required')
      return
    }
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(formData.client_name.trim())) {
      alert('⚠️ Client Name: Only alphabets and spaces are allowed')
      return
    }

    // Validate phone number - only digits
    if (!formData.client_phone_number.trim()) {
      alert('⚠️ Phone Number is required')
      return
    }
    const phoneRegex = /^[0-9]+$/
    if (!phoneRegex.test(formData.client_phone_number.trim())) {
      alert('⚠️ Phone Number: Only numbers are allowed')
      return
    }
    if (formData.client_phone_number.trim().length < 10 || formData.client_phone_number.trim().length > 15) {
      alert('⚠️ Phone Number: Must be between 10-15 digits')
      return
    }

    // Validate email format if provided
    if (formData.client_email && formData.client_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.client_email)) {
        alert('⚠️ Email: Please enter a valid email address')
        return
      }
    }

    // Validate address
    if (!formData.client_address.trim()) {
      alert('⚠️ Client Address is required')
      return
    }

    // Validate pickup location
    if (!formData.pickup_location.trim()) {
      alert('⚠️ Pickup Location is required')
      return
    }

    // Validate merchant
    if (!selectedMerchant) {
      alert('⚠️ Merchant is required')
      return
    }

    // Validate payouts - only numbers
    if (formData.rider_payout && formData.rider_payout.trim()) {
      const payoutRegex = /^[0-9]+(\.[0-9]{1,2})?$/
      if (!payoutRegex.test(formData.rider_payout)) {
        alert('⚠️ Rider Payout: Only numbers are allowed')
        return
      }
    }

    if (formData.company_payout && formData.company_payout.trim()) {
      const payoutRegex = /^[0-9]+(\.[0-9]{1,2})?$/
      if (!payoutRegex.test(formData.company_payout)) {
        alert('⚠️ Company Payout: Only numbers are allowed')
        return
      }
    }
    
    try {
      const dataToSend = {
        ...formData,
        merchant_id: selectedMerchant.id,
        assigned_to: formData.assigned_to || null,
        parcel_status: formData.parcel_status.replace(/ /g, '_'),
        client_email: formData.client_email.trim() || null
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/parcels', dataToSend, { timeout: 30000 })
      const data = response.data
      const parcelId = data?.data?.parcel_id || data?.parcel_id
      
      setNewParcelId(parcelId)
      
      const assignedRider = data.assigned_rider_name || 'N/A'
      const aiStatus = data.ai_assignment === 'success' ? '✅ AI assigned rider' : '⚠️ No rider available in city'
      const emailStatus = data.email_sent ? '\n📧 Email sent to client' : ''
      alert(`✅ Parcel added successfully!\n\nTracking: ${data.tracking_code}\nAssigned to: ${assignedRider}\n${aiStatus}${emailStatus}`)
      
      setFormData({
        tracking_code: '',
        client_name: '',
        client_phone_number: '',
        client_address: '',
        client_email: '',
        pickup_location: '',
        pickup_city: '',
        assigned_to: '',
        parcel_status: 'pending',
        payment_method: '',
        rider_payout: '',
        company_payout: ''
      })
      
      setParcelFormOpen(false)
      setSelectedMerchant(null)
      
      axios.get('http://127.0.0.1:8000/api/generate-tracking-code')
        .then(response => {
          setFormData(prev => ({
            ...prev,
            tracking_code: response.data.tracking_code
          }))
        })
        .catch(err => {})
      
      await fetchParcels()
      
    } catch (error) {
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || error.message || 'Error adding parcel'
      alert(`❌ Error: ${errorMessages}`)
    }
  }, [formData, selectedMerchant, fetchParcels])

  const handleEdit = useCallback((parcel) => {
    setEditingParcel(parcel)
    setFormData({
      tracking_code: parcel.tracking_code || '',
      client_name: parcel.details?.client_name || '',
      client_phone_number: parcel.details?.client_phone_number || '',
      client_address: parcel.details?.client_address || '',
      client_email: parcel.details?.client_email || '',
      pickup_location: parcel.pickup_location || '',
      pickup_city: parcel.pickup_city || '',
      assigned_to: parcel.assigned_to ?? '',
      parcel_status: parcel.parcel_status || 'pending',
      payment_method: parcel.payment_method || '',
      rider_payout: parcel.rider_payout || '',
      company_payout: parcel.company_payout || ''
    })
    setEditOpen(true)
  }, [])

  const handleMerchantSelect = useCallback((merchant) => {
    setSelectedMerchant(merchant)
    setOpen(false)
    setParcelFormOpen(true)
  }, [])

  const handleEditSubmit = useCallback(async () => {
    try {
      const dataToSend = {
        ...formData,
        assigned_to: formData.assigned_to === '' ? null : formData.assigned_to,
        parcel_status: formData.parcel_status.replace(/ /g, '_')
      }
      await axios.put(`http://127.0.0.1:8000/api/parcels/${editingParcel.parcel_id}`, dataToSend, { timeout: 10000 })
      setEditOpen(false)
      setEditingParcel(null)
      await fetchParcels()
      alert('Parcel updated successfully!')
    } catch (error) {
      const errorMessages = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Error updating parcel'
      alert(`Error: ${errorMessages}`)
    }
  }, [formData, editingParcel, fetchParcels])

  const handleApprovePickup = useCallback(async (parcelId) => {
    if (!confirm('Approve pickup for this parcel?')) return
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/parcels/${parcelId}`, {
        parcel_status: 'picked_up',
        picked_up_at: new Date().toISOString()
      })
      alert('✅ Pickup approved successfully!')
      await fetchParcels()
    } catch (error) {
      alert('❌ Error approving pickup')
    }
  }, [fetchParcels])

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

  const handleRetryAssignments = useCallback(async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auto-assign-pending')
      
      const assignedCount = response.data.assigned || 0
      if (assignedCount > 0) {
        alert(`✅ ${assignedCount} parcel(s) assigned successfully using AI!`)
      } else {
        alert('ℹ️ No pending parcels to assign. All parcels are already assigned or no riders available in pickup cities.')
      }
      
      await fetchParcels()
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || 'Failed to retry assignments'}`)  
    }
  }, [fetchParcels])

  const handleVerifyOpen = useCallback((parcel) => {
    setVerifyParcel(parcel)
    setVerificationCode('')
    setVerifyMessage({ type: '', text: '' })
    setVerifyOpen(true)
    setTimeout(() => {
      verificationInputRef.current?.focus()
    }, 100)
  }, [])

  const handleVerifySubmit = useCallback(async () => {
    if (!verificationCode.trim()) {
      setVerifyMessage({ type: 'error', text: 'Please enter verification code' })
      return
    }
    if (verificationCode.length !== 4) {
      setVerifyMessage({ type: 'error', text: 'Code must be 4 digits' })
      return
    }
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/verify-delivery', {
        tracking_code: verifyParcel.tracking_code,
        verification_code: verificationCode
      })
      setVerifyMessage({ type: 'success', text: response.data.message || 'Parcel delivered successfully!' })
      setTimeout(() => {
        setVerifyOpen(false)
        fetchParcels()
      }, 1500)
    } catch (error) {
      setVerifyMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid verification code' 
      })
    }
  }, [verificationCode, verifyParcel, fetchParcels])

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'delivered': return 'success'
      case 'out_for_delivery': return 'warning'
      case 'pending': return 'error'
      case 'pickup_requested': return 'info'
      case 'picked_up': return 'secondary'
      default: return 'default'
    }
  }, [])

  const handleOpenMap = (type) => {
    setMapType(type)
    setMapOpen(true)
  }

  const handleMapSelect = (locationData) => {
    if (mapType === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickup_location: locationData.address,
        pickup_city: locationData.city
      }))
    } else if (mapType === 'client') {
      setFormData(prev => ({
        ...prev,
        client_address: locationData.address
      }))
    }
    setMapOpen(false)
  }

  // OPTIMIZED: Memoize parcels to prevent unnecessary re-renders
  const memoizedParcels = useMemo(() => parcels, [parcels])

  if (loading) {
    return <div style={{textAlign: 'center', padding: '20px', fontSize: '18px'}}>Loading...</div>
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <p>Total Parcels: {memoizedParcels.length}</p>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="secondary" onClick={handleRetryAssignments}>
            🔄 Retry Pending Assignments
          </Button>
          <Button variant="contained" onClick={handleOpenDialog}>
            Add New Parcel
          </Button>
        </Box>
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
              <TableCell style={{color: 'white'}}>Assigned To</TableCell>
              <TableCell style={{color: 'white'}}>Status</TableCell>
              <TableCell style={{color: 'white'}}>Payment</TableCell>
              <TableCell style={{color: 'white'}}>Rider Payout</TableCell>
              <TableCell style={{color: 'white'}}>Company Payout</TableCell>
              <TableCell style={{color: 'white'}}>Actions</TableCell>
              <TableCell style={{color: 'white'}}>Verify</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(memoizedParcels) && memoizedParcels.map((item) => (
              <TableRow 
                key={item.parcel_id}
                sx={{
                  backgroundColor: item.parcel_id === newParcelId ? '#e3f2fd' : 'inherit',
                  transition: 'background-color 0.5s ease'
                }}
              >
                <TableCell>{item.tracking_code || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_name || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_phone_number || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_address || 'N/A'}</TableCell>
                <TableCell>{item.details?.client_email || 'N/A'}</TableCell>
                <TableCell>
                  {item.pickup_location || 'N/A'}
                  {item.pickup_city && <>, {item.pickup_city}</>}
                </TableCell>
                <TableCell>
                  {item.assigned_to ? (
                    // Rider accepted - show only that rider
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 1,
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '20px',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                    }}>
                      <CheckCircle sx={{ fontSize: 18 }} />
                      Rider #{item.assigned_to}
                    </Box>
                  ) : (
                    // Pending - show all 3 riders who got request
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {riderRequests[item.parcel_id]?.length > 0 ? (
                        riderRequests[item.parcel_id].map((req, idx) => (
                          <Box 
                            key={idx}
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 1,
                              padding: '6px 12px',
                              background: req.request_status === 'accepted' 
                                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                : req.request_status === 'rejected'
                                ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              borderRadius: '15px',
                              color: 'white',
                              fontSize: '13px',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                              }
                            }}
                          >
                            {req.request_status === 'pending' && '⏳'}
                            {req.request_status === 'accepted' && '✅'}
                            {req.request_status === 'rejected' && '❌'}
                            Rider #{req.rider_id}
                            {req.rider_score && (
                              <Chip 
                                label={`Score: ${req.rider_score}`} 
                                size="small" 
                                sx={{ 
                                  height: '20px', 
                                  fontSize: '11px',
                                  backgroundColor: 'rgba(255,255,255,0.3)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                          </Box>
                        ))
                      ) : (
                        <Chip 
                          label="N/A" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      )}
                    </Box>
                  )}
                </TableCell>
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
                    {item.parcel_status === 'pickup_requested' && (
                      <Tooltip title="Approve Pickup">
                        <IconButton size="small" color="success" onClick={() => handleApprovePickup(item.parcel_id)}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
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
                <TableCell>
                  {item.parcel_status !== 'delivered' ? (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleVerifyOpen(item)}
                    >
                      Verify
                    </Button>
                  ) : (
                    <Chip label="Verified" color="success" size="small" />
                  )}
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
            <tr ref={tableEndRef} style={{ height: 0 }} />
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Select Merchant</Typography>
            <Chip label={`${merchants.length} Approved`} color="success" size="small" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <TableCell style={{color: 'white'}}>ID</TableCell>
                  <TableCell style={{color: 'white'}}>Owner Name</TableCell>
                  <TableCell style={{color: 'white'}}>Business Name</TableCell>
                  <TableCell style={{color: 'white'}}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchants.length > 0 ? (
                  merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>{merchant.id}</TableCell>
                      <TableCell>{merchant.first_name} {merchant.last_name}</TableCell>
                      <TableCell>{merchant.company?.company_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="contained" size="small" onClick={() => handleMerchantSelect(merchant)}>Select</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} style={{textAlign: 'center', padding: '40px'}}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        ⚠️ No Approved Merchants Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please wait for admin to approve merchant registrations.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={parcelFormOpen} onClose={() => setParcelFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">Add New Parcel</Typography>
              <Typography variant="caption" color="primary">Merchant: {selectedMerchant?.company_name || selectedMerchant?.business_name}</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button startIcon={<QrCodeScanner />} onClick={() => setScannerOpen(true)} variant="outlined" size="small">
                Scan QR
              </Button>
              <Button onClick={() => { setParcelFormOpen(false); setSelectedMerchant(null); setOpen(true); }} variant="outlined" size="small">
                ← Back
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField name="tracking_code" label="Tracking Code (Auto-generated)" value={formData.tracking_code} fullWidth disabled />
            <TextField name="client_name" label="Client Name *" value={formData.client_name} onChange={handleChange} fullWidth autoComplete="off" />
            <TextField name="client_phone_number" label="Phone Number *" value={formData.client_phone_number} onChange={handleChange} fullWidth autoComplete="off" />
            <TextField name="client_address" label="Client Address *" value={formData.client_address} onChange={handleChange} fullWidth 
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleOpenMap('client')} color="primary">
                    <LocationOn />
                  </IconButton>
                )
              }}
            />
            <TextField name="client_email" label="Email (Optional)" value={formData.client_email} onChange={handleChange} fullWidth type="email" />
            <TextField name="pickup_location" label="Pickup Location *" value={formData.pickup_location} onChange={handleChange} fullWidth 
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleOpenMap('pickup')} color="primary">
                    <LocationOn />
                  </IconButton>
                )
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Pickup City *</InputLabel>
              <Select name="pickup_city" value={formData.pickup_city} onChange={handleChange} label="Pickup City *" required>
                {cities.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 1 }}>
              🤖 Rider will be automatically assigned by AI based on city and availability
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="parcel_status" value={formData.parcel_status} onChange={handleChange} label="Status">
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select name="payment_method" value={formData.payment_method} onChange={handleChange} label="Payment Method">
                {paymentMethods.map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField name="rider_payout" label="Rider Payout" value={formData.rider_payout} onChange={handleChange} fullWidth />
            <TextField name="company_payout" label="Company Payout" value={formData.company_payout} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setParcelFormOpen(false); setSelectedMerchant(null); }}>Close</Button>
          <Button onClick={handleSubmit} variant="contained">Add Parcel</Button>
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

      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} maxWidth="sm" fullWidth TransitionProps={{ timeout: 200 }}>
        <DialogTitle style={{textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px'}}>
          Verify Delivery
        </DialogTitle>
        <DialogContent style={{ paddingTop: '24px' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {verifyMessage.text && (
              <Alert severity={verifyMessage.type}>{verifyMessage.text}</Alert>
            )}
            <Box textAlign="center" mb={1}>
              <Typography variant="subtitle1" color="textSecondary">Tracking Code</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {verifyParcel?.tracking_code}
              </Typography>
            </Box>
            <TextField
              inputRef={verificationInputRef}
              fullWidth
              label="4-Digit Verification Code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                setVerificationCode(value)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && verificationCode.length === 4) {
                  handleVerifySubmit()
                }
              }}
              inputProps={{ 
                maxLength: 4, 
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { textAlign: 'center', fontSize: '28px', letterSpacing: '12px', fontWeight: 'bold' } 
              }}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions style={{padding: '16px 24px'}}>
          <Button onClick={() => setVerifyOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleVerifySubmit} variant="contained" color="success" disabled={verificationCode.length !== 4}>Verify</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Parcel</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField name="tracking_code" label="Tracking Code" value={formData.tracking_code} onChange={handleChange} fullWidth disabled />
            <TextField name="client_name" label="Client Name" value={formData.client_name} onChange={handleChange} fullWidth />
            <TextField name="client_phone_number" label="Phone Number" value={formData.client_phone_number} onChange={handleChange} fullWidth />
            <TextField name="client_address" label="Address" value={formData.client_address} onChange={handleChange} fullWidth 
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleOpenMap('client')} color="primary">
                    <LocationOn />
                  </IconButton>
                )
              }}
            />
            <TextField name="client_email" label="Email" value={formData.client_email} onChange={handleChange} fullWidth type="email" />
            <TextField name="pickup_location" label="Pickup Location" value={formData.pickup_location} onChange={handleChange} fullWidth 
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleOpenMap('pickup')} color="primary">
                    <LocationOn />
                  </IconButton>
                )
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Pickup City</InputLabel>
              <Select name="pickup_city" value={formData.pickup_city} onChange={handleChange} label="Pickup City">
                {cities.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select name="assigned_to" value={formData.assigned_to} onChange={handleChange} label="Assigned To">
                <MenuItem value="">N/A</MenuItem>
                {riders.map(rider => (
                  <MenuItem key={rider.id} value={rider.id}>
                    {rider.id} - {rider.first_name} {rider.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="parcel_status" value={formData.parcel_status} onChange={handleChange} label="Status">
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select name="payment_method" value={formData.payment_method} onChange={handleChange} label="Payment Method">
                {paymentMethods.map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField name="rider_payout" label="Rider Payout" value={formData.rider_payout} onChange={handleChange} fullWidth />
            <TextField name="company_payout" label="Company Payout" value={formData.company_payout} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      <FreeMapPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelectLocation={handleMapSelect}
        title={mapType === 'pickup' ? 'Select Pickup Location' : 'Select Client Address'}
        initialCity={formData.pickup_city}
      />
    </div>
  )
}

export default Products
