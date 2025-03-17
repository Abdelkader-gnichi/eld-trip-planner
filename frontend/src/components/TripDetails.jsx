import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { tripService } from '../services/api';
import RouteMap from './RouteMap';
import ELDLogs from './ELDLogs';
import TripSummary from './TripSummary';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripData = await tripService.getTrip(id);
        const routeData = await tripService.getRoute(id);
        const logsData = await tripService.getLogs(id);

        setTrip(tripData);
        setRoute(routeData);
        setLogs(logsData);
        setLoading(false);
      } catch (err) {
        setError('Error loading trip data');
        setLoading(false);
        console.error('Error fetching trip data:', err);
      }
    };

    fetchTripData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Trip not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Trip Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" component="div">
                Origin: <Chip label={trip.current_location} />
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" component="div">
                Pickup: <Chip label={trip.pickup_location} />
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" component="div">
                Destination: <Chip label={trip.dropoff_location} />
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="trip information tabs"
            centered
          >
            <Tab label="Trip Summary" />
            <Tab label="Route Map" />
            <Tab label="ELD Logs" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TripSummary trip={trip} route={route} logs={logs} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <RouteMap route={route} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ELDLogs logs={logs} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TripDetails;