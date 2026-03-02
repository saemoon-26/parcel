import React, { useState } from 'react'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Business } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const MerchantLogin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

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

      if (response.data.role === 'merchant') {
        localStorage.setItem('merchantToken', response.data.token)
        localStorage.setItem('merchantData', JSON.stringify(response.data))
        alert('Login successful!')
        navigate('/merchant/dashboard')
      } else {
        setError('Invalid merchant credentials')
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const status = error.response.data.approval_status
        if (status === 'pending') {
          setError('Your registration is under review. Please wait for admin approval.')
        } else if (status === 'rejected') {
          setError('Your registration was rejected. Please contact support.')
        }
      } else if (error.response?.status === 401) {
        setError('Invalid email or password')
      } else {
        setError('Login failed. Please try again.')
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
            <Business sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Merchant Login</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} fullWidth sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
            <TextField label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange('password')} fullWidth sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>{loading ? 'Checking...' : 'Login'}</Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/merchant/register')}>Register New Account</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default MerchantLogin
