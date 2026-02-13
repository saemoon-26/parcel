import React, { useState } from 'react'
import { Box, Tabs, Tab, Typography } from '@mui/material'
import { People, HowToReg } from '@mui/icons-material'
import Riders from './Riders'
import RegisteredRiders from './RegisteredRiders'

const RidersMain = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Riders Management
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<People />} 
          label="All Riders" 
          iconPosition="start"
        />
        <Tab 
          icon={<HowToReg />} 
          label="Registered Riders" 
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 && <Riders />}
      {activeTab === 1 && <RegisteredRiders />}
    </Box>
  )
}

export default RidersMain