import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const riderToken = localStorage.getItem('riderToken')
    const merchantToken = localStorage.getItem('merchantToken')

    if (adminToken) navigate('/admin-dashboard', { replace: true })
    else if (riderToken) navigate('/rider-dashboard', { replace: true })
    else if (merchantToken) navigate('/merchant/dashboard', { replace: true })
  }, [])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: formData.email,
        password: formData.password
      })


      const role = response.data.role
      const status = response.data.status


      // Check status for rider and merchant
      if (role === 'rider' || role === 'merchant') {
        if (status === 'pending') {
          setError(`⏳ Your ${role} registration is under review. Please wait for admin approval.`)
          setLoading(false)
          return
        } else if (status === 'rejected') {
          setError(`❌ Your ${role} registration was rejected. Please contact support for more information.`)
          setLoading(false)
          return
        } else if (status !== 'active') {
          setError(`⚠️ Your account status is: ${status}. Please contact support.`)
          setLoading(false)
          return
        }
      }

      // If status is active or admin, proceed with login
      if (role === 'admin') {
        const adminData = {
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          role: response.data.role
        }
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminData', JSON.stringify(adminData))
        alert('✅ Admin login successful!')
        navigate('/admin-dashboard', { replace: true })
      } else if (role === 'merchant') {
        const merchantData = {
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          role: response.data.role,
          company_info: response.data.company_info
        }
        localStorage.setItem('merchantToken', response.data.token)
        localStorage.setItem('merchantData', JSON.stringify(merchantData))
        alert('✅ Merchant login successful!')
        navigate('/merchant/dashboard', { replace: true })
      } else if (role === 'rider') {
        // Backend returns id directly in response.data
        const riderData = {
          id: response.data.id,
          user_id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          role: response.data.role,
          status: response.data.status
        }
        
        localStorage.setItem('riderToken', response.data.token)
        localStorage.setItem('riderData', JSON.stringify(riderData))
        localStorage.setItem('riderId', response.data.id.toString())
        
        console.log('✅ Rider logged in:', riderData)
        alert('✅ Rider login successful!')
        navigate('/rider-dashboard', { replace: true })
      } else {
        setError('Invalid user role: ' + role)
      }
    } catch (error) {
      
      
      // Handle backend errors
      if (error.response?.status === 403) {
        const errorData = error.response.data
        const status = errorData.status || errorData.approval_status
        
        if (status === 'pending') {
          setError('⏳ Your registration is under review. Please wait for admin approval.')
        } else if (status === 'rejected') {
          setError('❌ Your registration was rejected. Please contact support.')
        } else {
          setError(errorData.message || 'Access denied. Please contact support.')
        }
      } else if (error.response?.status === 401) {
        setError('❌ Invalid email or password. Please try again.')
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('❌ Login failed. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
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
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Login</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Welcome back! Please login to continue.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField 
              label="Email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange('email')} 
              fullWidth 
              sx={{ mb: 2 }} 
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment> 
              }} 
            />
            <TextField 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password} 
              onChange={handleChange('password')} 
              fullWidth 
              sx={{ mb: 3 }} 
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, 
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> 
              }} 
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large" 
              disabled={loading} 
              sx={{ py: 1.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {loading ? 'Checking...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Don't have an account?
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/register')}>
              Register New Account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
