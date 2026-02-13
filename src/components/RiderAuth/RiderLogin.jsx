import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const RiderLogin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    setError('')
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Check registration status first
      const statusResponse = await axios.post('http://localhost:8000/api/rider/check-status', {
        email: formData.email
      })
      
      const status = statusResponse.data.status
      
      if (status === 'pending') {
        setError('Your registration is under review. Please wait for admin approval.')
        setLoading(false)
        return
      }
      
      if (status === 'rejected') {
        setError(`Your registration was rejected. Reason: ${statusResponse.data.rejection_reason || 'Please contact support.'}`)
        setLoading(false)
        return
      }
      
      if (status === 'not_found') {
        setError('No registration found with this email. Please register first.')
        setLoading(false)
        return
      }
      
      // Try login for approved riders
      const response = await axios.post('http://localhost:8000/api/rider/login', {
        email: formData.email,
        password: formData.password
      })
      
      // Save token
      localStorage.setItem('riderToken', response.data.token)
      localStorage.setItem('riderData', JSON.stringify(response.data.rider))
      
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        navigate('/rider/dashboard')
      }, 1500)
      
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid email or password.')
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Unable to connect to server. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }
    
    handleLogin()
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
        maxWidth: 400,
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Person sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              Rider Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Welcome back! Please login to continue.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

<form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              fullWidth
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              {loading ? 'Please wait...' : 'Login'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Don't have an account?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/rider/register')}
                sx={{ fontWeight: 'bold', color: '#667eea', borderColor: '#667eea' }}
              >
                Register New Account
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/rider/status')}
                sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                  }
                }}
              >
                Check Registration Status
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RiderLogin