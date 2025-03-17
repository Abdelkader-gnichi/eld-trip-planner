import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { tripService } from '../services/api';
import { format } from 'date-fns';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading trips');
        setLoading(false);
        console.error('Error fetching trips:', err);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Trips
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {trips.length === 0 ? (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="info">
              You haven't created any trips yet. Start by planning a new trip.
            </Alert>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/"
              sx={{ mt: 2 }}
            >
              Plan New Trip
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>From</TableCell>
                  <TableCell>Pickup</TableCell>
                  <TableCell>Dropoff</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.current_location}</TableCell>
                    <TableCell>{trip.pickup_location}</TableCell>
                    <TableCell>{trip.dropoff_location}</TableCell>
                    <TableCell>
                      {format(new Date(trip.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined"
                        component={RouterLink}
                        to={`/trips/${trip.id}`}
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default TripList;