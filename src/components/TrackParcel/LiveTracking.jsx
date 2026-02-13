import { useState, useEffect, useRef } from 'react'
import { Box, Card, Typography, Avatar, Chip, IconButton, Paper, LinearProgress } from '@mui/material'
import { Phone, Navigation, AccessTime, LocalShipping, Close, MyLocation, LocationOn, Speed } from '@mui/icons-material'
import './LiveTracking.css'

const LiveTracking = ({ trackingCode, onClose }) => {
  const [trackingData, setTrackingData] = useState(null)
  const [riderLocation, setRiderLocation] = useState(null)
  const [clientLocation, setClientLocation] = useState(null)
  const [distance, setDistance] = useState(null)
  const [eta, setEta] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const clientMarkerRef = useRef(null)
  const routeLineRef = useRef(null)

  useEffect(() => {
    loadLeaflet()
    fetchLiveTracking()
    const interval = setInterval(fetchLiveTracking, 5000)
    return () => {
      clearInterval(interval)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [trackingCode])

  useEffect(() => {
    if (trackingData && riderLocation && clientLocation) {
      const dist = calculateDistance(
        riderLocation.lat,
        riderLocation.lng,
        clientLocation.lat,
        clientLocation.lng
      )
      setDistance(dist)
      setEta(calculateETA(dist))
      drawRoute(
        { latitude: riderLocation.lat, longitude: riderLocation.lng },
        { latitude: clientLocation.lat, longitude: clientLocation.lng }
      )
    }
  }, [riderLocation, clientLocation])

  const loadLeaflet = () => {
    setTimeout(() => {
      if (mapRef.current && window.L) {
        initMap()
      }
    }, 100)
  }

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) {
      console.log('Map init skipped:', { hasRef: !!mapRef.current, hasInstance: !!mapInstanceRef.current })
      return
    }

    console.log('Initializing map...')
    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([24.8607, 67.0011], 13)
    
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map
    console.log('Map initialized successfully')
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateETA = (distanceKm) => {
    const avgSpeed = 30
    const hours = distanceKm / avgSpeed
    const minutes = Math.round(hours * 60)
    return minutes
  }

  const geocodeClientAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Pakistan')}&limit=1&countrycodes=pk`
      )
      const data = await response.json()
      
      if (data && data[0]) {
        const coords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }
        console.log('Geocoded client address:', coords)
        updateClientLocation(coords)
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
    }
  }

  const fetchLiveTracking = async () => {
    try {
      console.log('Fetching tracking data for:', trackingCode)
      const response = await fetch(`http://127.0.0.1:8000/api/track/live/${trackingCode}`)
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.status && result.tracking_available) {
        const isFirstLoad = !trackingData
        setTrackingData(result.data)
        
        if (isFirstLoad) {
          setTimeout(() => {
            if (mapRef.current && window.L && !mapInstanceRef.current) {
              initMap()
            }
          }, 200)
        }
        
        // Rider location from backend
        if (result.data.rider_location) {
          updateRiderLocation(result.data.rider_location)
        }
        
        // Client location - geocode address if coordinates are default/invalid
        if (result.data.client_location && result.data.client_address) {
          const lat = parseFloat(result.data.client_location.latitude)
          const lng = parseFloat(result.data.client_location.longitude)
          
          // Check if coordinates are default Faisalabad coordinates
          if (lat === 31.4504 && lng === 73.135) {
            // Geocode the actual address
            geocodeClientAddress(result.data.client_address)
          } else {
            // Use coordinates from database
            updateClientLocation(result.data.client_location)
          }
        }
      } else {
        console.log('Tracking not available:', result)
      }
    } catch (error) {
      console.error('Live tracking error:', error)
    }
  }

  const updateRiderLocation = (location) => {
    if (!location || !location.latitude || !location.longitude) {
      console.log('Invalid rider location:', location)
      return
    }
    
    const lat = parseFloat(location.latitude)
    const lng = parseFloat(location.longitude)
    console.log('Updating rider location:', { lat, lng })
    setRiderLocation({ lat, lng })

    if (mapInstanceRef.current && window.L) {
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([lat, lng])
      } else {
        const riderIcon = window.L.divIcon({
          html: `<div class="rider-marker-self">
                  <div class="marker-pulse-self"></div>
                  <div class="marker-icon-self">🏍️</div>
                  <div class="marker-label">Rider</div>
                 </div>`,
          className: '',
          iconSize: [60, 60],
          iconAnchor: [30, 30]
        })
        riderMarkerRef.current = window.L.marker([lat, lng], { icon: riderIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup('<b>🏍️ Rider Location</b><br>On the way!')
        console.log('Rider marker added')
      }
    } else {
      console.log('Map not ready for rider marker')
    }
  }

  const updateClientLocation = (location) => {
    if (!location) return
    const lat = parseFloat(location.latitude)
    const lng = parseFloat(location.longitude)
    console.log('Updating client location:', { lat, lng })
    setClientLocation({ lat, lng })

    if (mapInstanceRef.current && window.L) {
      if (clientMarkerRef.current) {
        clientMarkerRef.current.setLatLng([lat, lng])
      } else {
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
          .bindPopup(`<b>📍 Delivery Location</b><br>${trackingData?.client_name || 'Customer'}<br>${trackingData?.client_address || ''}`)
        console.log('Client marker added at:', lat, lng)
      }
    }
  }

  const drawRoute = async (riderLoc, clientLoc) => {
    if (!mapInstanceRef.current || !window.L) return

    const riderLatLng = [parseFloat(riderLoc.latitude), parseFloat(riderLoc.longitude)]
    const clientLatLng = [parseFloat(clientLoc.latitude), parseFloat(clientLoc.longitude)]

    // Remove old route
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current)
    }

    try {
      // Get actual road route from OSRM
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${riderLoc.longitude},${riderLoc.latitude};${clientLoc.longitude},${clientLoc.latitude}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
        
        // Draw actual road route
        routeLineRef.current = window.L.polyline(coordinates, {
          color: '#2196F3',
          weight: 5,
          opacity: 0.8,
          className: 'animated-route'
        }).addTo(mapInstanceRef.current)

        // Update distance from actual route
        const routeDistance = (route.distance / 1000).toFixed(1)
        setDistance(parseFloat(routeDistance))
        setEta(Math.round(route.duration / 60))
      } else {
        // Fallback to straight line
        routeLineRef.current = window.L.polyline([riderLatLng, clientLatLng], {
          color: '#2196F3',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
          className: 'animated-route'
        }).addTo(mapInstanceRef.current)
      }
    } catch (error) {
      console.error('Routing error:', error)
      // Fallback to straight line
      routeLineRef.current = window.L.polyline([riderLatLng, clientLatLng], {
        color: '#2196F3',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        className: 'animated-route'
      }).addTo(mapInstanceRef.current)
    }

    const bounds = window.L.latLngBounds([riderLatLng, clientLatLng])
    mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 })
  }

  return (
    <Box className="live-tracking-container">
      <IconButton className="close-btn" onClick={onClose}>
        <Close />
      </IconButton>

      <Box className="map-container" ref={mapRef} sx={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

      {!trackingData ? (
        <Box className="loading-animation">
          <LocalShipping className="loading-icon" />
          <Typography>Loading live tracking...</Typography>
        </Box>
      ) : (
        <Card className="tracking-info-card glass-card">
          <Box className="rider-header">
            <Avatar className="rider-avatar" sx={{ bgcolor: '#2196F3', width: 64, height: 64 }}>
              {trackingData.rider.name.charAt(0)}
            </Avatar>
            <Box className="rider-details">
              <Typography variant="h6" className="rider-name">{trackingData.rider.name}</Typography>
              <Box className="rider-meta">
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant="body2">{trackingData.rider.phone}</Typography>
              </Box>
            </Box>
            <Chip 
              label={trackingData.parcel_status.replace(/_/g, ' ')} 
              className="status-chip"
              color="success"
              icon={<LocalShipping />}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {distance && eta && (
            <Box className="distance-eta-container">
              <Paper className="distance-card" elevation={0}>
                <Box className="distance-icon-wrapper">
                  <Navigation className="distance-icon" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="primary">
                    {distance.toFixed(1)} <span style={{fontSize: '1rem'}}>km</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Distance Away</Typography>
                </Box>
              </Paper>

              <Paper className="eta-card" elevation={0}>
                <Box className="eta-icon-wrapper">
                  <Speed className="eta-icon" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="success.main">
                    {eta} <span style={{fontSize: '1rem'}}>min</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Estimated Time</Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <Box className="progress-section">
            <Box className="progress-header">
              <Box className="progress-point">
                <MyLocation sx={{ fontSize: 20, color: '#2196F3' }} />
                <Typography variant="body2" fontWeight="600">Rider Location</Typography>
              </Box>
              <Box className="progress-point">
                <LocationOn sx={{ fontSize: 20, color: '#4CAF50' }} />
                <Typography variant="body2" fontWeight="600">Your Location</Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="indeterminate" 
              className="animated-progress"
              sx={{ height: 6, borderRadius: 3, mt: 1 }}
            />
          </Box>

          <Box className="address-section">
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              🎯 Delivery Address
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {trackingData.client_name || 'Customer'}
            </Typography>
            <Typography variant="body2" fontWeight="500" sx={{ mt: 0.5 }}>
              {trackingData.client_address || 'Address not available'}
            </Typography>
          </Box>

          <Box className="delivery-message">
            <Box className="pulse-dot" />
            <Typography variant="body2" color="success.main" fontWeight="600">
              Your rider is on the way! 🚀
            </Typography>
          </Box>
        </Card>
      )}
    </Box>
  )
}

export default LiveTracking
