import { useState, useCallback, useRef } from 'react'
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Alert } from '@mui/material'
import { MyLocation, Search } from '@mui/icons-material'

const libraries = ['places']

const MapPicker = ({ open, onClose, onSelectLocation, title = "Select Location", initialCity = "" }) => {
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [searchBox, setSearchBox] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const searchInputRef = useRef(null)

  const cityCoordinates = {
    'Karachi': { lat: 24.8607, lng: 67.0011 },
    'Lahore': { lat: 31.5204, lng: 74.3587 },
    'Islamabad': { lat: 33.6844, lng: 73.0479 },
    'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
    'Faisalabad': { lat: 31.4504, lng: 73.1350 },
    'Multan': { lat: 30.1575, lng: 71.5249 },
    'Peshawar': { lat: 34.0151, lng: 71.5249 },
    'Quetta': { lat: 30.1798, lng: 66.9750 },
    'Sialkot': { lat: 32.4945, lng: 74.5229 },
    'Gujranwala': { lat: 32.1877, lng: 74.1945 },
    'Hyderabad': { lat: 25.3960, lng: 68.3578 },
    'Sukkur': { lat: 27.7052, lng: 68.8574 }
  }

  const [center, setCenter] = useState(
    initialCity && cityCoordinates[initialCity] 
      ? cityCoordinates[initialCity] 
      : { lat: 30.3753, lng: 69.3451 }
  )

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '8px'
  }

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onAutocompleteLoad = useCallback((autocomplete) => {
    setSearchBox(autocomplete)
  }, [])

  const onPlaceChanged = () => {
    if (searchBox !== null) {
      const place = searchBox.getPlace()
      
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        
        setMarker(location)
        setSelectedAddress(place.formatted_address || place.name)
        
        const addressComponents = place.address_components || []
        let city = ''
        for (let component of addressComponents) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            city = component.long_name
            break
          }
        }
        setSelectedCity(city)
        
        if (map) {
          map.panTo(location)
          map.setZoom(15)
        }
      }
    }
  }

  const onMapClick = useCallback((e) => {
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }
    
    setMarker(location)
    
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedAddress(results[0].formatted_address)
        
        const addressComponents = results[0].address_components || []
        let city = ''
        for (let component of addressComponents) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
            city = component.long_name
            break
          }
        }
        setSelectedCity(city)
      }
    })
  }, [])

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setMarker(location)
          setCenter(location)
          
          if (map) {
            map.panTo(location)
            map.setZoom(15)
          }
          
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setSelectedAddress(results[0].formatted_address)
              
              const addressComponents = results[0].address_components || []
              let city = ''
              for (let component of addressComponents) {
                if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                  city = component.long_name
                  break
                }
              }
              setSelectedCity(city)
            }
          })
        },
        (error) => {
          alert('Unable to get your location')
        }
      )
    }
  }

  const handleConfirm = () => {
    if (marker && selectedAddress) {
      onSelectLocation({
        address: selectedAddress,
        city: selectedCity,
        lat: marker.lat,
        lng: marker.lng
      })
      onClose()
    } else {
      alert('Please select a location on the map')
    }
  }

  const handleClose = () => {
    setMarker(null)
    setSelectedAddress('')
    setSelectedCity(initialCity)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Search color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
            libraries={libraries}
          >
            <Box display="flex" gap={1} mb={2}>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                restrictions={{ country: 'pk' }}
                style={{ flex: 1 }}
              >
                <TextField
                  inputRef={searchInputRef}
                  fullWidth
                  placeholder="Search location..."
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Autocomplete>
              <Button
                variant="outlined"
                startIcon={<MyLocation />}
                onClick={handleCurrentLocation}
              >
                Current
              </Button>
            </Box>

            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={initialCity ? 12 : 6}
              onLoad={onLoad}
              onClick={onMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true
              }}
            >
              {marker && <Marker position={marker} animation={window.google.maps.Animation.DROP} />}
            </GoogleMap>
          </LoadScript>

          {selectedAddress && (
            <Alert severity="success" icon={false}>
              <Typography variant="subtitle2" fontWeight="bold">Selected Address:</Typography>
              <Typography variant="body2">{selectedAddress}</Typography>
              {selectedCity && (
                <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                  City: {selectedCity}
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
          disabled={!marker || !selectedAddress}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MapPicker
