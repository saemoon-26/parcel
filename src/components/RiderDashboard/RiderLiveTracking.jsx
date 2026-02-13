import { useState, useEffect, useRef } from 'react'
import { Box, Card, Typography, Button, IconButton, Switch, FormControlLabel, Alert } from '@mui/material'
import { Close, MyLocation, Navigation, GpsFixed, GpsOff } from '@mui/icons-material'
import './RiderLiveTracking.css'

const RiderLiveTracking = ({ parcel, onClose, isClientView = false }) => {
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [clientCoords, setClientCoords] = useState(null)
  const [error, setError] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [deliveryStarted, setDeliveryStarted] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const clientMarkerRef = useRef(null)
  const routeLineRef = useRef(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    loadLeaflet()
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (deliveryStarted) {
        fetch(`http://127.0.0.1:8000/api/riders/tracking/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tracking_code: parcel.tracking_code,
            rider_id: parcel.assigned_to || null
          })
        })
      }
    }
  }, [deliveryStarted])

  const loadLeaflet = () => {
    if (window.L) {
      setTimeout(() => initMap(), 100)
      return
    }
    
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      setTimeout(() => initMap(), 100)
    }
    document.body.appendChild(script)
  }

  const initMap = () => {
    if (!mapRef.current) {
      console.log('Map ref not ready')
      return
    }
    if (mapInstanceRef.current) {
      console.log('Map already initialized')
      return
    }

    try {
      const map = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([24.8607, 67.0011], 13)
      
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
      console.log('Map initialized successfully')
      
      // Geocode client address
      geocodeClientAddress()
    } catch (error) {
      console.error('Map initialization error:', error)
      setError('Failed to load map. Please refresh.')
    }
  }

  const geocodeClientAddress = async () => {
    try {
      const address = parcel.client_address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Pakistan')}&limit=1&countrycodes=pk`
      )
      const data = await response.json()
      
      if (data && data[0]) {
        const coords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }
        setClientCoords(coords)
        showClientMarker(coords.latitude, coords.longitude)
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
    }
  }

  const showClientMarker = (lat, lng) => {
    if (!mapInstanceRef.current || !window.L) {
      console.log('Map or Leaflet not ready for client marker')
      return
    }

    try {
      const clientIcon = window.L.divIcon({
        html: `<div class="client-marker-rider">
                <div class="marker-pin-rider">🎯</div>
               </div>`,
        className: '',
        iconSize: [50, 50],
        iconAnchor: [25, 50]
      })
      
      clientMarkerRef.current = window.L.marker([lat, lng], { icon: clientIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>📍 Delivery Location</b><br>${parcel.client_name}<br>${parcel.client_address}`)
      
      mapInstanceRef.current.setView([lat, lng], 14)
      console.log('Client marker added at:', lat, lng)
    } catch (error) {
      console.error('Error adding client marker:', error)
    }
  }

  const startDelivery = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/riders/tracking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: parcel.tracking_code,
          rider_id: parcel.assigned_to || null
        })
      })
      
      if (response.ok) {
        setDeliveryStarted(true)
        startTracking()
      } else {
        setError('Failed to start delivery')
      }
    } catch (error) {
      console.error('Error starting delivery:', error)
      setError('Failed to start delivery')
    }
  }

  const stopDelivery = async () => {
    try {
      stopTracking()
      const response = await fetch(`http://127.0.0.1:8000/api/riders/tracking/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: parcel.tracking_code,
          rider_id: parcel.assigned_to || null
        })
      })
      
      if (response.ok) {
        setDeliveryStarted(false)
        console.log('Delivery stopped, tracking_active = 0')
      }
    } catch (error) {
      console.error('Error stopping delivery:', error)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    // Clear any existing watch first
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        console.log('GPS Update:', { latitude, longitude, accuracy })
        
        setCurrentLocation({ latitude, longitude })
        updateRiderMarker(latitude, longitude)
        sendLocationToBackend(latitude, longitude)
        
        if (clientCoords) {
          drawRoute(latitude, longitude, clientCoords.latitude, clientCoords.longitude)
        }
      },
      (error) => {
        console.error('GPS error:', error)
        setError('Unable to get your location. Please enable GPS.')
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
    console.log('GPS watch started with ID:', watchIdRef.current)
  }

  const stopTracking = () => {
    console.log('Stopping GPS watch ID:', watchIdRef.current)
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      console.log('GPS tracking stopped')
    }
    setIsTracking(false)
  }

  const updateRiderMarker = (lat, lng) => {
    if (!mapInstanceRef.current || !window.L) return

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([lat, lng])
    } else {
      const riderIcon = window.L.divIcon({
        html: `<div class="rider-marker-self">
                <div class="marker-pulse-self"></div>
                <div class="marker-icon-self">🏍️</div>
                <div class="marker-label">You</div>
               </div>`,
        className: '',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      })
      riderMarkerRef.current = window.L.marker([lat, lng], { icon: riderIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>🏍️ Your Location</b><br>Tracking Active')
    }

    mapInstanceRef.current.setView([lat, lng], 15)
  }

  const drawRoute = async (riderLat, riderLng, clientLat, clientLng) => {
    if (!mapInstanceRef.current || !window.L) return

    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current)
    }

    try {
      // Get actual road route from OSRM
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${riderLng},${riderLat};${clientLng},${clientLat}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
        
        routeLineRef.current = window.L.polyline(coordinates, {
          color: '#4CAF50',
          weight: 5,
          opacity: 0.8,
          className: 'animated-route-rider'
        }).addTo(mapInstanceRef.current)
      } else {
        // Fallback
        routeLineRef.current = window.L.polyline(
          [[riderLat, riderLng], [clientLat, clientLng]], 
          {
            color: '#4CAF50',
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 10',
            className: 'animated-route-rider'
          }
        ).addTo(mapInstanceRef.current)
      }
    } catch (error) {
      console.error('Routing error:', error)
      // Fallback
      routeLineRef.current = window.L.polyline(
        [[riderLat, riderLng], [clientLat, clientLng]], 
        {
          color: '#4CAF50',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 10',
          className: 'animated-route-rider'
        }
      ).addTo(mapInstanceRef.current)
    }

    const bounds = window.L.latLngBounds([[riderLat, riderLng], [clientLat, clientLng]])
    mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 })
  }

  const sendLocationToBackend = async (latitude, longitude) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/riders/location/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: parcel.tracking_code,
          rider_id: parcel.assigned_to || null,
          latitude,
          longitude
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Backend error:', error)
      } else {
        console.log('Location sent successfully')
      }
    } catch (error) {
      console.error('Error sending location:', error)
    }
  }

  return (
    <Box className="rider-live-tracking-container">
      <IconButton className="close-btn-rider" onClick={onClose}>
        <Close />
      </IconButton>

      <Box className="map-container-rider" ref={mapRef} />

      <Card className="rider-control-card">
        <Box className="control-header">
          <Typography variant="h6" fontWeight="700" color="primary">
            🏍️ Delivery Navigation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tracking: {parcel.tracking_code}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isClientView && (
          <>
            <Box className="tracking-toggle">
              <FormControlLabel
                control={
                  <Switch
                    checked={isTracking}
                    onChange={(e) => e.target.checked ? startTracking() : stopTracking()}
                    color="success"
                    size="large"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isTracking ? <GpsFixed color="success" /> : <GpsOff color="disabled" />}
                    <Typography fontWeight="600">
                      {isTracking ? 'Tracking Active' : 'Start Tracking'}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {!deliveryStarted ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<MyLocation />}
                onClick={startDelivery}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                🚀 Start Delivery
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={stopDelivery}
                sx={{
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                ⏹️ Stop Delivery
              </Button>
            )}
          </>
        )}

        {isTracking && currentLocation && (
          <Box className="location-info-box">
            <Box className="location-status">
              <Box className="pulse-indicator" />
              <Typography variant="body2" color="success.main" fontWeight="600">
                Location sharing active
              </Typography>
            </Box>
            <Box className="coordinates">
              <Navigation sx={{ fontSize: 18, color: '#666' }} />
              <Typography variant="caption" color="text.secondary">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Typography>
            </Box>
          </Box>
        )}

        <Box className="delivery-info">
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            🎯 Deliver To:
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary">
            {parcel.client_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            📞 {parcel.client_phone_number}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2, borderLeft: '3px solid #4CAF50' }}>
            📍 {parcel.client_address}
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}

export default RiderLiveTracking
