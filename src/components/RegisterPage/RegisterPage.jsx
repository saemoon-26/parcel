import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material'
import { DirectionsBike, Business, LocalShipping } from '@mui/icons-material'

const RegisterPage = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Circles */}
      <Box sx={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        top: '-200px',
        left: '-200px',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        bottom: '-150px',
        right: '-150px',
        animation: 'float 8s ease-in-out infinite'
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Header with Icon */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex',
            p: 3,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            mb: 2,
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            <LocalShipping sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: 'white', 
              mb: 1,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: '1px'
            }}
          >
            Welcome to Courier Hub
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 300 }}>
            Your Trusted Delivery Partner
          </Typography>
        </Box>

        {/* Main Card */}
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.95)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                textAlign: 'center', 
                mb: 1, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Join Our Platform
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, color: '#7f8c8d' }}>
              Select your role to get started
            </Typography>

            {/* Rider Button */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<DirectionsBike sx={{ fontSize: 28 }} />}
                onClick={() => navigate('/rider/register')}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.5)'
                  }
                }}
              >
                Register as Rider
              </Button>
            </Box>

            {/* Merchant Button */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Business sx={{ fontSize: 28 }} />}
                onClick={() => navigate('/merchant/register')}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  boxShadow: '0 8px 20px rgba(245, 87, 108, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #e082ea 0%, #e4465b 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(245, 87, 108, 0.5)'
                  }
                }}
              >
                Register as Merchant
              </Button>
            </Box>

            {/* Divider */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              my: 3,
              '&::before, &::after': {
                content: '""',
                flex: 1,
                borderBottom: '1px solid #e0e0e0'
              }
            }}>
              <Typography sx={{ px: 2, color: '#7f8c8d', fontSize: '0.875rem' }}>Already a member?</Typography>
            </Box>

            {/* Login Links */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')} 
                sx={{ 
                  flex: 1,
                  py: 1.2,
                  borderColor: '#667eea', 
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: '#5568d3',
                    background: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center', 
            mt: 4, 
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          © 2024 Courier Hub. All rights reserved.
        </Typography>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </Box>
  )
}

export default RegisterPage
