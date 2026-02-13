import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Chip,
  Divider
} from '@mui/material'
import { Email, Search, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const RiderStatusCheck = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  const handleCheckStatus = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setStatus(null)

    try {
      const response = await axios.post('http://localhost:8000/api/rider/check-status', {
        email: email
      })
      setStatus(response.data)
    } catch (error) {
      if (error.response?.status === 404) {
        setError('No registration found with this email address.')
      } else {
        setError('Unable to check status. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statusValue) => {
    if (statusValue === 'approved') return 'success'
    if (statusValue === 'rejected') return 'error'
    return 'warning'
  }

  const getStatusIcon = (statusValue) => {
    if (statusValue === 'approved') return <CheckCircle sx={{ color: '#4caf50' }} />
    if (statusValue === 'rejected') return <Cancel sx={{ color: '#f44336' }} />
    return <HourglassEmpty sx={{ color: '#ff9800' }} />
  }

  const getStatusMessage = (statusValue) => {
    if (statusValue === 'approved') return 'Congratulations! Your registration has been approved. You can now login to your account.'
    if (statusValue === 'rejected') return 'Unfortunately, your registration was not approved. Please contact support for more information.'
    return 'Your registration is currently under review. Please wait for admin approval.'
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card sx={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Search sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              Check Registration Status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email to check your registration status
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              )
            }}
          />

          <Button
            onClick={handleCheckStatus}
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>

          {status && (
            <Card sx={{ 
              mb: 3, 
              border: `2px solid ${getStatusColor(status.status) === 'success' ? '#4caf50' : 
                                   getStatusColor(status.status) === 'error' ? '#f44336' : '#ff9800'}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon(status.status)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    Registration Status
                  </Typography>
                </Box>
                
                <Chip 
                  label={status.status.toUpperCase()} 
                  color={getStatusColor(status.status)}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getStatusMessage(status.status)}
                </Typography>

                {status.status === 'rejected' && status.rejection_reason && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Rejection Reason:</strong> {status.rejection_reason}
                    </Typography>
                  </Alert>
                )}

                {status.status === 'approved' && (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        🎉 Your account is ready! You can now login and start delivering.
                      </Typography>
                    </Alert>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => navigate('/rider/login')}
                      sx={{ mt: 1 }}
                    >
                      Go to Login
                    </Button>
                  </Box>
                )}

                {status.status === 'pending' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      ⏳ Please wait while our team reviews your application. This usually takes 24-48 hours.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Need help?
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/rider/register')}
              sx={{ mr: 2, color: '#667eea' }}
            >
              Register New Account
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/rider/login')}
              sx={{ color: '#667eea' }}
            >
              Try Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RiderStatusCheck