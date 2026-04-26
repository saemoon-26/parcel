import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Alert, IconButton } from '@mui/material'
import { MyLocation, Search, Close } from '@mui/icons-material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const cityCoordinates = {
  'Karachi': [24.8607, 67.0011],
  'Lahore': [31.5204, 74.3587],
  'Islamabad': [33.6844, 73.0479],
  'Rawalpindi': [33.5651, 73.0169],
  'Faisalabad': [31.4504, 73.1350],
  'Multan': [30.1575, 71.5249],
  'Peshawar': [34.0151, 71.5249],
  'Quetta': [30.1798, 66.9750],
  'Sialkot': [32.4945, 74.5229],
  'Gujranwala': [32.1877, 74.1945],
  'Hyderabad': [25.3960, 68.3578],
  'Sukkur': [27.7052, 68.8574]
}

function LocationMarker({ position, setPosition, setAddress, setCity }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      
      // Reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          // Extract clean address parts
          const addr = data.address || {}
          const parts = []
          
          // Add neighborhood/suburb first
          if (addr.neighbourhood) parts.push(addr.neighbourhood)
          else if (addr.suburb) parts.push(addr.suburb)
          
          // Add house number and road
          if (addr.house_number) parts.push(addr.house_number)
          if (addr.road) parts.push(addr.road)
          
          // Add city
          const cityName = addr.city || addr.town || addr.village || addr.state || ''
          if (cityName) parts.push(cityName)
          
          const cleanAddress = parts.join(', ')
          setAddress(cleanAddress || data.display_name)
          setCity(cityName)
        })
        .catch(err => console.error(err))
    },
  })

  return position ? <Marker position={position} /> : null
}

function SearchControl({ setPosition, setAddress, setCity }) {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: 'pk',
      },
    })

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search location...',
    })

    map.addControl(searchControl)

    // Listen to search result selection
    map.on('geosearch/showlocation', (result) => {
      const { x, y, label } = result.location
      const newPos = [y, x]
      setPosition(newPos)
      
      // Get detailed address from coordinates
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${y}&lon=${x}`)
        .then(res => res.json())
        .then(data => {
          const addr = data.address || {}
          const parts = []
          
          if (addr.neighbourhood) parts.push(addr.neighbourhood)
          else if (addr.suburb) parts.push(addr.suburb)
          
          if (addr.house_number) parts.push(addr.house_number)
          if (addr.road) parts.push(addr.road)
          
          const cityName = addr.city || addr.town || addr.village || addr.state || ''
          if (cityName) parts.push(cityName)
          
          const cleanAddress = parts.join(', ')
          setAddress(cleanAddress || label)
          setCity(cityName)
        })
        .catch(err => {
          setAddress(label)
        })
    })

    return () => map.removeControl(searchControl)
  }, [map, setPosition, setAddress, setCity])

  return null
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  return null
}

const FreeMapPicker = ({ open, onClose, onSelectLocation, title = "Select Location", initialCity = "" }) => {
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState(initialCity)
  const [center, setCenter] = useState(
    initialCity && cityCoordinates[initialCity] 
      ? cityCoordinates[initialCity] 
      : [30.3753, 69.3451]
  )

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude]
          setPosition(newPos)
          setCenter(newPos)
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(data => {
              // Extract clean address parts
              const addr = data.address || {}
              const parts = []
              
              // Add neighborhood/suburb first
              if (addr.neighbourhood) parts.push(addr.neighbourhood)
              else if (addr.suburb) parts.push(addr.suburb)
              
              // Add house number and road
              if (addr.house_number) parts.push(addr.house_number)
              if (addr.road) parts.push(addr.road)
              
              // Add city
              const cityName = addr.city || addr.town || addr.village || addr.state || ''
              if (cityName) parts.push(cityName)
              
              const cleanAddress = parts.join(', ')
              setAddress(cleanAddress || data.display_name)
              setCity(cityName)
            })
            .catch(err => console.error(err))
        },
        (error) => {
          alert('Unable to get your location')
        }
      )
    }
  }

  const handleConfirm = () => {
    if (position && address) {
      onSelectLocation({
        address: address,
        city: city,
        lat: position[0],
        lng: position[1]
      })
      onClose()
    } else {
      alert('Please select a location on the map')
    }
  }

  const handleClose = () => {
    setPosition(null)
    setAddress('')
    setCity(initialCity)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Search color="primary" />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={handleCurrentLocation}
              fullWidth
            >
              Use Current Location
            </Button>
          </Box>

          <Alert severity="info" icon={<Search />}>
            <Typography variant="body2">
              🔍 Search location using search box on map OR click anywhere on map
            </Typography>
          </Alert>

          <Box sx={{ height: '500px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
            <MapContainer
              center={center}
              zoom={initialCity ? 12 : 6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <SearchControl 
                setPosition={setPosition}
                setAddress={setAddress}
                setCity={setCity}
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                setAddress={setAddress}
                setCity={setCity}
              />
              <RecenterMap center={center} />
            </MapContainer>
          </Box>

          {address && (
            <Alert severity="success" icon={false}>
              <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                ✅ Selected Address:
              </Typography>
              <Typography variant="body2" mt={0.5}>
                {address}
              </Typography>
              {city && (
                <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                  📍 City: {city}
                </Typography>
              )}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!position || !address}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FreeMapPicker
