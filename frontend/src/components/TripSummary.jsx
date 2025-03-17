import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RouteIcon from '@mui/icons-material/Route';
import EventIcon from '@mui/icons-material/Event';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const TripSummary = ({ trip, route, logs }) => {
  if (!trip || !route || route.length === 0) {
    return (
      <Typography variant="body1">
        No trip data available
      </Typography>
    );
  }

  // Calculate trip metrics
  const startPoint = route.find(p => p.point_type === 'START');
  const pickupPoint = route.find(p => p.point_type === 'PICKUP');
  const dropoffPoint = route.find(p => p.point_type === 'DROPOFF');
  const restStops = route.filter(p => p.point_type === 'REST');
  const fuelStops = route.filter(p => p.point_type === 'FUEL');
  
  const startTime = startPoint ? new Date(startPoint.departure_time || startPoint.arrival_time) : null;
  const endTime = dropoffPoint ? new Date(dropoffPoint.arrival_time) : null;
  
  let totalDrivingHours = 0;
  if (startTime && endTime) {
    // This is a simplification - in reality we'd need to subtract rest times
    totalDrivingHours = differenceInHours(endTime, startTime);
  }
  
  // Count days on the trip
  const uniqueDays = new Set();
  if (logs && logs.length > 0) {
    logs.forEach(log => uniqueDays.add(log.log_date));
  }
  const daysCount = uniqueDays.size || 1;

  return (
    <Grid container spacing={3}>
      {/* Trip Overview Section */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Trip Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MyLocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  <strong>Total Distance:</strong> {calculateTotalDistance(route)} miles
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  <strong>Total Duration:</strong> {formatDuration(startTime, endTime)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  <strong>Number of Days:</strong> {daysCount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Key Locations Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Locations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <MyLocationIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Starting Point" 
                  secondary={trip.current_location} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <RouteIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Pickup Location" 
                  secondary={trip.pickup_location} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <RouteIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dropoff Location" 
                  secondary={trip.dropoff_location} 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Schedule Information Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Schedule Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <HotelIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Required Rest Stops" 
                  secondary={`${restStops.length} stops`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalGasStationIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Fuel Stops" 
                  secondary={`${fuelStops.length} stops`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Estimated Driving Time" 
                  secondary={`${totalDrivingHours} hours`} 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Route Information Section */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Detailed Route Information
          </Typography>
          <Grid container spacing={2}>
            {route.map((point, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {point.point_type === 'START' && 'Starting Point'}
                      {point.point_type === 'PICKUP' && 'Pickup Location'}
                      {point.point_type === 'DROPOFF' && 'Dropoff Location'}
                      {point.point_type === 'REST' && 'Rest Stop'}
                      {point.point_type === 'FUEL' && 'Fuel Stop'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {point.location}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {point.arrival_time && `Arrival: ${format(new Date(point.arrival_time), 'PPpp')}`}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {point.departure_time && `Departure: ${format(new Date(point.departure_time), 'PPpp')}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Helper function to calculate total distance
const calculateTotalDistance = (route) => {
  return route.reduce((total, point) => total + (point.distance || 0), 0).toFixed(2);
};

// Helper function to format duration
const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  const hours = differenceInHours(endTime, startTime);
  const minutes = differenceInMinutes(endTime, startTime) % 60;
  return `${hours}h ${minutes}m`;
};

export default TripSummary;