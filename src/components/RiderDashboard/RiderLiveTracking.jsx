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
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const [heading, setHeading] = useState(0)
  const [speed, setSpeed] = useState(0)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const clientMarkerRef = useRef(null)
  const routeLineRef = useRef(null)
  const watchIdRef = useRef(null)
  const lastLocationRef = useRef(null)

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
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
      }).setView([24.8607, 67.0011], 17)
      
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
      console.log('Map initialized successfully')
      
      geocodeClientAddress()
    } catch (error) {
      console.error('Map initialization error:', error)
      setError('Failed to load map. Please refresh.')
    }
  }

  const geocodeClientAddress = async () => {
    try {
      const address = parcel.details?.client_address || parcel.client_address
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
        .bindPopup(`<b>📍 Delivery Location</b><br>${parcel.details?.client_name || parcel.client_name || 'Client'}<br>${parcel.details?.client_address || parcel.client_address || ''}`)
      
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

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading: gpsHeading, speed: gpsSpeed } = position.coords
        
        console.log('GPS Update:', { latitude, longitude, accuracy })
        
        // Calculate heading if GPS doesn't provide it
        let calculatedHeading = gpsHeading || 0
        if (lastLocationRef.current && !gpsHeading) {
          calculatedHeading = calculateBearing(
            lastLocationRef.current.latitude,
            lastLocationRef.current.longitude,
            latitude,
            longitude
          )
        }
        
        setHeading(calculatedHeading)
        setSpeed(gpsSpeed ? (gpsSpeed * 3.6).toFixed(0) : 0) // Convert m/s to km/h
        setCurrentLocation({ latitude, longitude })
        updateRiderMarker(latitude, longitude, calculatedHeading)
        sendLocationToBackend(latitude, longitude)
        
        if (clientCoords) {
          drawRoute(latitude, longitude, clientCoords.latitude, clientCoords.longitude)
        }
        
        lastLocationRef.current = { latitude, longitude }
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

  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * (Math.PI / 180)
    const toDeg = (rad) => rad * (180 / Math.PI)
    
    const dLon = toRad(lon2 - lon1)
    const y = Math.sin(dLon) * Math.cos(toRad(lat2))
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
    
    let bearing = toDeg(Math.atan2(y, x))
    return (bearing + 360) % 360
  }

  const updateRiderMarker = (lat, lng, heading) => {
    if (!mapInstanceRef.current || !window.L) return

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([lat, lng])
    } else {
      const riderIcon = window.L.divIcon({
        html: `<div class="rider-marker-self" style="transform: rotate(${heading}deg);">
                <div class="marker-pulse-self"></div>
                <div class="marker-icon-self">🏍️</div>
               </div>`,
        className: '',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      })
      riderMarkerRef.current = window.L.marker([lat, lng], { icon: riderIcon })
        .addTo(mapInstanceRef.current)
    }

    // Smooth camera follow with tilt
    mapInstanceRef.current.setView([lat, lng], 18, {
      animate: true,
      duration: 0.5,
      easeLinearity: 0.5
    })
  }

  const drawRoute = async (riderLat, riderLng, clientLat, clientLng) => {
    if (!mapInstanceRef.current || !window.L) return

    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current)
    }

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${riderLng},${riderLat};${clientLng},${clientLat}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
        
        // Set distance and duration
        setDistance((route.distance / 1000).toFixed(1)) // km
        setDuration(Math.ceil(route.duration / 60)) // minutes
        
        routeLineRef.current = window.L.polyline(coordinates, {
          color: '#4CAF50',
          weight: 6,
          opacity: 0.9,
          className: 'animated-route-rider'
        }).addTo(mapInstanceRef.current)
      }
    } catch (error) {
      console.error('Routing error:', error)
    }
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
      <Box className="map-container-rider" ref={mapRef} />

      {/* Close button when navigation not started */}
      {!deliveryStarted && (
        <IconButton 
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            '&:hover': { background: 'white' }
          }}
        >
          <Close />
        </IconButton>
      )}

      {/* Top Navigation Bar */}
      {deliveryStarted && distance && (
        <Box className="nav-top-bar">
          <Box className="nav-info">
            <Box className="nav-distance">
              <Typography variant="h4" fontWeight="900" color="white">
                {distance} km
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.9)">
                {duration} min
              </Typography>
            </Box>
            {speed > 0 && (
              <Box className="nav-speed">
                <Typography variant="h5" fontWeight="700" color="white">
                  {speed}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)">
                  km/h
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentLocation && (
              <IconButton 
                onClick={() => {
                  if (mapInstanceRef.current && currentLocation) {
                    mapInstanceRef.current.setView(
                      [currentLocation.latitude, currentLocation.longitude], 
                      18,
                      { animate: true, duration: 0.5 }
                    )
                  }
                }}
                sx={{ 
                  background: 'rgba(255,255,255,0.9)', 
                  color: '#4CAF50',
                  '&:hover': { background: 'white' }
                }}
              >
                <MyLocation />
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{ background: 'rgba(255,255,255,0.9)', color: '#f44336', '&:hover': { background: 'white' } }}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Bottom Control Card */}
      <Card className="rider-control-card-bottom">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!deliveryStarted ? (
          <Box>
            <Box className="delivery-info-compact">
              <Typography variant="subtitle2" color="text.secondary">
                🎯 Deliver To
              </Typography>
              <Typography variant="h6" fontWeight="700">
                {parcel.details?.client_name || parcel.client_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 {parcel.details?.client_address || parcel.client_address || 'N/A'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<MyLocation />}
              onClick={startDelivery}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                py: 2,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                mt: 2
              }}
            >
              🚀 Start Navigation
            </Button>
          </Box>
        ) : (
          <Box>
            <Box className="delivery-info-active">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box className="pulse-dot" />
                <Typography variant="caption" color="success.main" fontWeight="600">
                  Navigation Active
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="700">
                {parcel.details?.client_name || parcel.client_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📞 {parcel.details?.client_phone_number || parcel.client_phone_number || 'N/A'}
              </Typography>
            </Box>
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
                mt: 2
              }}
            >
              ⏹️ Stop Navigation
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default RiderLiveTracking
