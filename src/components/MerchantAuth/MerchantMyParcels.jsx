import React from 'react'
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

const MerchantMyParcels = ({ parcels }) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>My Parcels</Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tracking Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Receiver Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parcels.length > 0 ? parcels.map((parcel) => (
                  <TableRow key={parcel.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{parcel.tracking_code}</TableCell>
                    <TableCell>{parcel.receiver_name}</TableCell>
                    <TableCell>{parcel.receiver_city}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.875rem', fontWeight: 600, bgcolor: parcel.status === 'delivered' ? '#43e97b' : parcel.status === 'in_transit' ? '#4facfe' : '#f5576c', color: 'white' }}>
                        {parcel.status}
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(parcel.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#7f8c8d' }}>No parcels yet. Create your first parcel!</TableCell>
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
