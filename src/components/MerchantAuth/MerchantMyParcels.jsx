import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

const MerchantMyParcels = ({ parcels, filter = 'all', onBack }) => {
  const [filteredParcels, setFilteredParcels] = useState([])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredParcels(parcels)
    } else if (filter === 'pending') {
      setFilteredParcels(parcels.filter(p => {
        const status = (p.status || p.parcel_status || '').toLowerCase()
        return status === 'pending' || status === 'pickup_requested'
      }))
    } else if (filter === 'in_transit') {
      setFilteredParcels(parcels.filter(p => {
        const status = (p.status || p.parcel_status || '').toLowerCase()
        return status === 'in_transit' || status === 'picked_up' || status === 'out_for_delivery'
      }))
    } else if (filter === 'delivered') {
      setFilteredParcels(parcels.filter(p => {
        const status = (p.status || p.parcel_status || '').toLowerCase()
        return status === 'delivered'
      }))
    }
  }, [parcels, filter])

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower === 'delivered') return '#43e97b'
    if (statusLower === 'in_transit' || statusLower === 'picked_up' || statusLower === 'out_for_delivery') return '#4facfe'
    if (statusLower === 'pending' || statusLower === 'pickup_requested') return '#f5576c'
    return '#95a5a6'
  }

  const getFilterTitle = () => {
    if (filter === 'all') return 'All Parcels'
    if (filter === 'pending') return 'Pending Parcels'
    if (filter === 'in_transit') return 'In Transit Parcels'
    if (filter === 'delivered') return 'Delivered Parcels'
    return 'My Parcels'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {onBack && (
          <Button 
            startIcon={<ArrowBack />} 
            onClick={onBack}
            sx={{ 
              color: '#667eea',
              '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
            }}
          >
            Back to Dashboard
          </Button>
        )}
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c3e50' }}>{getFilterTitle()}</Typography>
        <Chip 
          label={`${filteredParcels.length} ${filteredParcels.length === 1 ? 'Parcel' : 'Parcels'}`}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}
        />
      </Box>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tracking Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Client Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Client Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pickup City</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assigned Rider</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParcels.length > 0 ? filteredParcels.map((parcel) => (
                  <TableRow key={parcel.parcel_id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{parcel.tracking_code}</TableCell>
                    <TableCell>{parcel.client_name || 'N/A'}</TableCell>
                    <TableCell>{parcel.client_phone_number || 'N/A'}</TableCell>
                    <TableCell>{parcel.pickup_city || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={(parcel.status || parcel.parcel_status || 'N/A').toUpperCase()}
                        size="small"
                        sx={{ 
                          bgcolor: getStatusColor(parcel.status || parcel.parcel_status),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>{parcel.assigned_rider_name || 'Not Assigned'}</TableCell>
                    <TableCell>{parcel.created_at ? new Date(parcel.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#7f8c8d' }}>
                      {filter === 'all' ? 'No parcels yet. Create your first parcel!' : `No ${filter} parcels found.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default MerchantMyParcels
