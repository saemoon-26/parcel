import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { Business, LocalShipping, Logout } from '@mui/icons-material'
import axios from 'axios'
import MerchantDashboardHome from './MerchantDashboardHome'
import MerchantCreateParcel from './MerchantCreateParcel'
import MerchantMyParcels from './MerchantMyParcels'

const MerchantDashboard = () => {
  const navigate = useNavigate()
  const [merchantData, setMerchantData] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 })
  const [allParcels, setAllParcels] = useState([])
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const data = localStorage.getItem('merchantData')
    if (!data) {
      navigate('/login')
      return
    }
    const merchant = JSON.parse(data)
    
    const fetchMerchantDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/merchants/${merchant.id}`)
        const fullData = response.data.data || response.data
        
        const merchantInfo = {
          id: fullData.id,
          business_name: fullData.company?.company_name || fullData.business_name || 'N/A',
          owner_name: `${fullData.first_name || ''} ${fullData.last_name || ''}`.trim() || fullData.owner_name || 'N/A',
          email: fullData.email || 'N/A',
          phone_number: fullData.phone || fullData.phone_number || 'N/A',
          city: fullData.address?.city || fullData.city || 'N/A',
          product_type: fullData.company?.product_type || fullData.product_type || 'N/A'
        }
        
        setMerchantData(merchantInfo)
        fetchParcels(fullData.id)
      } catch (error) {
        console.error('Error fetching merchant details:', error)
        setMerchantData(merchant)
        fetchParcels(merchant.id)
      }
    }
    
    fetchMerchantDetails()
  }, [])

  const fetchParcels = async (merchantId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/merchant/${merchantId}/parcels`)
      const parcels = response.data
      setAllParcels(parcels)
      
      setStats({
        total: parcels.length,
        pending: parcels.filter(p => p.status === 'pending').length,
        inTransit: parcels.filter(p => p.status === 'in_transit').length,
        delivered: parcels.filter(p => p.status === 'delivered').length
      })
    } catch (error) {
      console.error('Error fetching parcels:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merchantToken')
    localStorage.removeItem('merchantData')
    navigate('/', { replace: true })
  }

  const handleParcelCreated = () => {
    if (merchantData) {
      fetchParcels(merchantData.id)
    }
  }

  if (!merchantData) return null

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box sx={{ width: 280, bgcolor: '#34495e', color: 'white', p: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: '#2c3e50' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>Merchant Panel</Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mb: 0.5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, 
              bgcolor: currentPage === 'dashboard' ? 'rgba(52, 152, 219, 0.3)' : 'transparent' 
            }} 
            startIcon={<Business />}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mb: 0.5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              bgcolor: currentPage === 'parcels' ? 'rgba(52, 152, 219, 0.3)' : 'transparent'
            }} 
            startIcon={<LocalShipping />}
            onClick={() => setCurrentPage('parcels')}
          >
            My Parcels
          </Button>
          <Button 
            fullWidth 
            sx={{ 
              color: 'white', 
              justifyContent: 'flex-start', 
              mt: 5, 
              p: 1.5, 
              borderRadius: 1, 
              '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.2)' } 
            }} 
            startIcon={<Logout />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {currentPage === 'dashboard' && <MerchantDashboardHome merchantData={merchantData} stats={stats} />}
        {currentPage === 'parcels' && <MerchantMyParcels parcels={allParcels} />}
      </Box>
    </Box>
  )
}

export default MerchantDashboard
