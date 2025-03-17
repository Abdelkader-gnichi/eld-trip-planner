import React from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import HotelIcon from '@mui/icons-material/Hotel';
import FlagIcon from '@mui/icons-material/Flag';

// Fix for Leaflet marker icons
// (Required because React messes with the asset paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  START: createCustomIcon('green'),
  PICKUP: createCustomIcon('blue'),
  REST: createCustomIcon('orange'),
  FUEL: createCustomIcon('yellow'),
  DROPOFF: createCustomIcon('red')
};

const RouteMap = ({ route }) => {
  if (!route || route.length === 0) {
    return (
      <Typography variant="body1">
        No route data available
      </Typography>
    );
  }

  // Extract coordinates for the polyline
  const positions = route.map(point => [point.latitude, point.longitude]);
  
  // Find bounds for the map
  const bounds = L.latLngBounds(positions);
  
  // Get icon and label based on point type
  const getPointIcon = (type) => {
    switch (type) {
      case 'START': return <LocationOnIcon color="success" />;
      case 'PICKUP': return <LocalShippingIcon color="primary" />;
      case 'REST': return <HotelIcon color="warning" />;
      case 'FUEL': return <LocalGasStationIcon color="error" />;
      case 'DROPOFF': return <FlagIcon color="error" />;
      default: return <LocationOnIcon />;
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ height: '500px', overflow: 'hidden' }}>
          <MapContainer 
            bounds={bounds} 
            style={{ height: '100%', width: '100%' }}
            zoom={5}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Draw the route line */}
            <Polyline 
              positions={positions} 
              color="blue" 
              weight={4} 
              opacity={0.7} 
            />
            
            {/* Add markers for each point */}
            {route.map((point, index) => (
              <Marker 
                key={index} 
                position={[point.latitude, point.longitude]}
                icon={icons[point.point_type]}
              >
                <Popup>
                  <Typography variant="body2" fontWeight="bold">
                    {point.point_type}: {point.location}
                  </Typography>
                  <Typography variant="body2">
                    Arrival: {format(new Date(point.arrival_time), 'MMM d, yyyy h:mm a')}
                  </Typography>
                  {point.departure_time && (
                    <Typography variant="body2">
                      Departure: {format(new Date(point.departure_time), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Route Stops
        </Typography>
        
        <Grid container spacing={2}>
          {route.map((point, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getPointIcon(point.point_type)}
                    <Typography variant="h6" component="div" ml={1}>
                      {point.point_type}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {point.location}
                  </Typography>
                  
                  <Typography variant="body2">
                    Arrival: {format(new Date(point.arrival_time), 'MMM d, h:mm a')}
                  </Typography>
                  
                  {point.departure_time && (
                    <Typography variant="body2">
                      Departure: {format(new Date(point.departure_time), 'MMM d, h:mm a')}
                    </Typography>
                  )}
                  
                  {point.duration > 0 && (
                    <Chip 
                      size="small" 
                      label={`${point.duration} min`} 
                      sx={{ mt: 1 }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RouteMap;